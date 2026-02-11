import { createClient } from 'redis';

let redisClient = null;
let isConnected = false;

// Inicializar Redis
export const initRedis = async () => {
  // Si el caché está deshabilitado, no hacer nada
  if (process.env.CACHE_ENABLED === 'false') {
    console.log('📦 Caché deshabilitado (CACHE_ENABLED=false)');
    return;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis: Demasiados reintentos, deshabilitando caché');
            return new Error('Too many retries');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis conectado');
      isConnected = true;
    });

    redisClient.on('ready', () => {
      console.log('📦 Redis listo para usar');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconectando...');
    });

    await redisClient.connect();
  } catch (error) {
    console.warn('⚠️  Redis no disponible, continuando sin caché:', error.message);
    redisClient = null;
    isConnected = false;
  }
};

// Obtener del caché
export const getCache = async (key) => {
  if (!isConnected || !redisClient) return null;

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error al obtener del caché:', error.message);
    return null;
  }
};

// Guardar en caché
export const setCache = async (key, value, ttl = 300) => {
  if (!isConnected || !redisClient) return false;

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error al guardar en caché:', error.message);
    return false;
  }
};

// Invalidar caché
export const deleteCache = async (key) => {
  if (!isConnected || !redisClient) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Error al invalidar caché:', error.message);
    return false;
  }
};

// Invalidar múltiples claves por patrón
export const deleteCachePattern = async (pattern) => {
  if (!isConnected || !redisClient) return false;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Error al invalidar caché por patrón:', error.message);
    return false;
  }
};

// Middleware de caché para Express
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Crear clave única basada en la URL
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Intentar obtener del caché
      const cachedData = await getCache(key);

      if (cachedData) {
        console.log(`📦 Cache HIT: ${key}`);
        return res.json(cachedData);
      }

      console.log(`📦 Cache MISS: ${key}`);

      // Interceptar res.json para guardar en caché
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        // Guardar en caché solo si la respuesta es exitosa
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(key, data, duration).catch(err =>
            console.error('Error guardando en caché:', err)
          );
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Error en middleware de caché:', error);
      next();
    }
  };
};

// Cerrar conexión Redis
export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis desconectado');
  }
};

export default redisClient;
