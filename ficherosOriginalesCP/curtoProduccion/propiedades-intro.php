<?php
    $objectData = new stdClass();
    $objectData-> price_from = '0';
    $objectData-> price_to = '99999999';
    $objectData-> operation_types =[1,2,3];
    $objectData-> property_types =[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];

    $objectDataEncoded= json_encode($objectData);
    $objectDataEncodedUrl = urlencode($objectDataEncoded);
    $data = curl_init();

    $urlApiTokko= 'http://tokkobroker.com/api/v1/property/get_search_summary/?format=json&data=';
	$key= '&key=4fbfb1318c148749d76fa87803fcb5ed83620e7f' ;
	$requestUrl = $urlApiTokko.$objectDataEncodedUrl.$key;
    
    curl_setopt($data, CURLOPT_URL, $requestUrl);

    curl_setopt($data, CURLOPT_RETURNTRANSFER, true);
    
    curl_setopt($data, CURLOPT_HEADER, 0);
    
    $response = curl_exec($data);
    $responseDecoded = json_decode($response, true);
    $objectsByLocation = $responseDecoded['objects']['locations'];

    curl_close($data);
?>
<?php

	$url = 'buscar-propiedades';

	$permit = '';

	$pathRoot = '';

	require_once($pathRoot . 'inc/common.php');

	/*--------------------------------------------------------------*/
	// LANG:
	/*--------------------------------------------------------------*/

	if (!isset($_REQUEST['lang']) or $_REQUEST['lang']=='') {
		$lang = 'es';
	} else {
		$lang = $_REQUEST['lang'];
	}

	require_once('lang/'. $lang .'/lang.php');

?>
<!DOCTYPE html>
<html lang="es">
 <head>
    <title>Propiedades | Curto Propiedades</title>

    <?php include('inc/head.php'); ?>

    <?php include('inc/head_seo1.php'); ?>

    <!-- Facebook Pixel Code -->
	<script>
	!function(f,b,e,v,n,t,s)
	{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
	n.callMethod.apply(n,arguments):n.queue.push(arguments)};
	if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
	n.queue=[];t=b.createElement(e);t.async=!0;
	t.src=v;s=b.getElementsByTagName(e)[0];
	s.parentNode.insertBefore(t,s)}(window, document,'script',
	'https://connect.facebook.net/en_US/fbevents.js');
	fbq('init', '336608014017160');
	fbq('track', 'PageView');
	</script>
	<noscript><img height="1" width="1" style="display:none"
	src="https://www.facebook.com/tr?id=336608014017160&ev=PageView&noscript=1"
	/></noscript>
	<!-- End Facebook Pixel Code -->

</head>
<body>
  
	<?php include('inc/header.php'); ?>

	<div class="wrapper">

		<section id="propiedades">

			<div id="hero-busqueda">
				<div class="container fh1">
					<div class="busqueda-form">
						<h1 class="hero-title mg-b"><?php echo $t['prp']['1']; ?></h1>
						<div class="bg">
							<form id="form-propiedades-search" action="propiedades-list.php" method="GET" enctype="multipart/form-data" data-toggle="validator" data-focus="false">
								<?php $valuesOfTypeOperation = [
                                    '0'=> $t['prp']['2'],
                                    'all'=> $t['prp']['0'],
                                    '1'=> $t['prp']['46'],
                                    '2'=> $t['prp']['47'],
                                    '3'=> $t['prp']['48'],
                                    ]
								?>
								<input type="hidden" name="mode" value="propiedades-search">
								<input type="hidden" name="lang" value="<?php echo $lang; ?>">
								<div class="row">
									<div class="col-sm-6 col-md-3">
										<div class="form-group">
											<select id="tipo-operacion" name="tipo_operacion" class="form-control" required="true">
											<?php foreach ($valuesOfTypeOperation as $key => $value) : ?>
                                                <option value="<?php echo $key?>"<?php echo ($key ==  $operationType) ? 'selected' : '';?>><?php echo $value?></option>
                                            <?php endforeach; ?>
											</select>
											<div class="help-block with-errors title-xxsm font-2"></div>
										</div>
									</div>
									<div class="col-sm-6 col-md-3">
										<?php
            								$valuesOfTypeProperty = [
            								    '0' => $t['prp']['3'] ,
            								    'all' => $t['prp']['0'] ,
												'1' => $t['prp']['39'] ,
												'2' => $t['prp']['37'] ,
												'3' => $t['prp']['36'],
												'4' => $t['prp']['49'],
												'5' => $t['prp']['40'],
												'7' => $t['prp']['38'],
												'9' => $t['prp']['43'],
												'10' => $t['prp']['44'],
												'14' => $t['prp']['42'],
												'24' => $t['prp']['41'],
												'13' => $t['prp']['45'],
            								];
										?>
										<div class="form-group">
											<select id="tipo-propiedad" name="tipo_propiedad" class="form-control">
												<?php foreach ($valuesOfTypeProperty as $key => $value) : ?>
                                                    <option value="<?php echo $key?>"<?php echo ($key == $propertyType) ? 'selected' : '';?>><?php echo $value?></option>
                                                <?php endforeach; ?>
											</select>
										</div>
									</div>
									<div class="col-sm-6 col-md-4">
										<div class="form-group mg-b-xs-xs">
											<input type="text" id="zona" name="zona" list="suggestions"  class="form-control typeahead" placeholder="<?php echo $t['prp']['4']; ?>" autocomplete="off">
											<datalist class="options-datalist" id="suggestions">
											<?php foreach ($objectsByLocation as $key => $value) : ?>
                                                <option value="<?php echo $value['location_name'];?>" data-target-option-list="<?php echo $value['location_id'];?>"><?php echo $value['location_name'];?></option>
                                            <?php endforeach; ?>
											</datalist>
											<input type="hidden" id="id-zona" name="id_zona" class="form-control typeahead" placeholder="<?php echo $t['prp']['4']; ?>" autocomplete="off">
										</div> 
									</div>
									<div class="col-sm-6 col-md-2">
										<button type="submit" class="btn btn-color4 full"><?php echo $t['gui']['1']; ?></button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>

			<div class="pd-v-xlg">
				<div class="container">
					<div class="row">
						<div class="col-md-8 col-md-offset-2">
							<p class="large text-center mg-xlg-b"><?php echo $t['prp']['5']; ?></p>
						</div>
					</div>
					<div class="row">
						<div class="col-md-8 col-md-offset-2">
							<div class="row">
								<div class="col-xs-6 col-sm-3 col-no-pd-r mg-b-xs-xs">
									<span class="link-icon">
										<i class="icon-icon11"></i>
										<hr/>
										<span class="caption"><?php echo $t['prp']['6']; ?></span>
									</span>
								</div>
								<div class="col-xs-6 col-sm-3 col-no-pd-r col-no-pd-l mg-b-xs-xs">
									<span class="link-icon">
										<i class="icon-icon14"></i>
										<hr/>
										<span class="caption"><?php echo $t['prp']['7']; ?></span>
									</span>	
								</div>
								<div class="col-xs-6 col-sm-3 col-no-pd-r col-no-pd-l mg-b-xs-xs">
									<span class="link-icon">
										<i class="icon-icon16"></i>
										<hr/>
										<span class="caption"><?php echo $t['prp']['8']; ?></span>
									</span>
								</div>
								<div class="col-xs-6 col-sm-3 col-no-pd-l mg-b-xs-xs">
									<span class="link-icon">
										<i class="icon-icon5"></i>
										<hr/>
										<span class="caption"><?php echo $t['prp']['9']; ?></span>
									</span>	
								</div>
							</div>						
						</div>
					</div>
				</div>
			</div>

		</section>
		
	</div>

	<?php include('inc/footer.php'); ?>

	<script type="text/javascript">

		$(function(){

			$('#nav-main a.propiedades').addClass('active');

			var substringMatcher = function(strs) {
				return function findMatches(q, cb) {
					var matches, substringRegex;
					matches = [];
					substrRegex = new RegExp(q, 'i');
					$.each(strs, function(i, str) {
						if (substrRegex.test(str)) {
							matches.push(str);
						}
					});
					cb(matches);
				};
			};

			var zonas_dataset = [ <?php echo $buffer_zonas; ?> ];

			const inputZona = document.querySelector("#zona");
			
			inputZona.addEventListener('input', e => {
				const inputIdZona = document.querySelector("#id-zona");
			 	const inputZona = document.querySelector("#zona");
				const optionsZona = document.getElementById('suggestions').childNodes;
				
				// Recorrer opciones para validar nombre
				for(let i = 0; i < optionsZona.length; i++) {
					// Si el nombre tecleado es igual al de la opción
					if(inputZona.value == optionsZona[i].innerText) {
						// Asignar ID y salir del ciclo
						inputIdZona.value = optionsZona[i].dataset.targetOptionList;
						break;
					}
				}

			});
			
			const formSearch = document.querySelector('#form-propiedades-search');
			formSearch.addEventListener('submit', formSubmit, false);

			function formSubmit(e){
				e.preventDefault();

				let inputTipoOperacionValue = document.querySelector("#tipo-operacion").value;
				let inputTipoPropiedadValue= document.querySelector("#tipo-propiedad").value;
				let inputZonaValue = document.querySelector("#zona").value;
				let convertedString = inputZonaValue.toString();
				let optionsZona = document.getElementById('suggestions').childNodes;
				let found ;

				for (let i = 0; i < optionsZona.length; i++) {
  					if (optionsZona[i].textContent == convertedString) {
    					found = optionsZona[i];
    					break;
				  	}
				}
				
				let encodedString = encodeURIComponent(convertedString);
				let convertedOfRegex = encodedString.replace(/%20|\+/g, "+");
				let idOptionsZona = found.getAttribute('data-target-option-list');
				let idOptionsZonaString = idOptionsZona.toString(); 
				let url = "?tipo_operacion="+inputTipoOperacionValue+"&tipo_propiedad="+inputTipoPropiedadValue+"&id_zona="+idOptionsZonaString+"&tipo_zona="+convertedOfRegex
				window.location.replace('propiedades-list.php'+ url);
			}
			
            $('#form-propiedades-search').validator().on('submit', function(e){
                if (e.isDefaultPrevented()) {
					return false;
              	} else {
              		$(this).attr('action','propiedades-list.php');
              	}
          	});

		});

	</script>

</body>
</html>