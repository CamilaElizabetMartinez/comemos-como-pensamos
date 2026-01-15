<?php
	$idTheProperty = $_GET['id'];
	
	$objectData = new stdClass();
    $objectData-> id = $idTheProperty;

	$objectDataEncode = json_encode($objectData);
    $objectDataEncodeUrl = urlencode($objectDataEncode);

    $data = curl_init();
	
	$urlApiTokko ='http://www.tokkobroker.com/api/v1/property/';
	$key = '/?lang=es_ar&format=json&key=4fbfb1318c148749d76fa87803fcb5ed83620e7f';
	$resquestUrl = $urlApiTokko.$idTheProperty.$key;

    curl_setopt($data, CURLOPT_URL, $resquestUrl);

    curl_setopt($data, CURLOPT_RETURNTRANSFER, true);
    
    curl_setopt($data, CURLOPT_HEADER, 0);
    
    $response = curl_exec($data);
    $responseDecoded = json_decode($response, true);

	$address = $responseDecoded['address'];
	$typeTheCurrecy = $responseDecoded['operations'][0]['prices'][0]['currency'];
	$typeTheCurrecyAr = $responseDecoded['operations'][1]['prices'][0]['currency'];
	$result = str_replace("S","$", $typeTheCurrecy);
	$resultAr = str_replace("S","$", $typeTheCurrecyAr);
	$valueThePrice = $responseDecoded['operations'][0]['prices'][0]['price'];
	$valueThePriceAr = $responseDecoded['operations'][1]['prices'][0]['price'];
	$valueThePriceFormatted = number_format($valueThePrice);
	$valueThePriceReplace = str_replace(",",".", $valueThePriceFormatted);
	$valueThePriceFormattedAr = number_format($valueThePriceAr);
	$valueThePriceReplaceAr = str_replace(",",".", $valueThePriceFormattedAr);
	$valueTheOperationS = $responseDecoded['operations'][0]['operation_type'];
	$valueTheOperationR = $responseDecoded['operations'][1]['operation_type'];
	$geoLat = $responseDecoded['geo_lat'];
	$geoLong = $responseDecoded['geo_long'];
    
    curl_close($data);
?>
<?php

	$url = 'propiedad';

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

	/*--------------------------------------------------------------*/
	// PROPIEDADES:
	/*--------------------------------------------------------------*/

	require_once($pathRoot . 'lib/cls/cls.propiedad.php');

	$obj = new clsPropiedad();

	if ($_REQUEST['id']!='') {
	  	
	  	$obj->find($_REQUEST['id']);

		if ($_SESSION['cliente_id']!='') {
			$client_fav = '<a href="#" class="add-fav btn btn-color2-bg small full" data-propiedad-id="'. $obj->id .'">'. $t['gui']['3'] .'</a>';
		} else {
			$client_fav = '<a href="#" class="btn btn-color2-bg small full" data-toggle="modal" data-target="#modal-login">'. $t['gui']['3'] .'</a>';
		}

		$url = 'propiedad/'. $obj->id;

		//---//

		if ($obj->estado_en_profit=='R' or $obj->estado_en_profit=='RESERVADO') {
			$reservado = '<span class="font-2 color-3 blink">RESERVADO</span>&nbsp;';
		} else {
			$reservado = '';
		}

	}

	/*--------------------------------------------------------------*/
	// LANG:
	/*--------------------------------------------------------------*/

	switch ($lang) {
		case 'es':
			$titulo = $obj->titulo_es;
			$descripcion = $obj->descripcion_es;
			break;
		case 'en':
			$titulo = $obj->titulo_en;
			$descripcion = $obj->descripcion_en;
			break;
		case 'pt':
			$titulo = $obj->titulo_pt;
			$descripcion = $obj->descripcion_pt;
			break;
	}

	$arr_images = $responseDecoded['photos'];

	$count_images = count($arr_images);

	$main_thumb =  $responseDecoded['photos'][0]['image'];

	$seo_title =  $responseDecoded['address'];

	$seo_desc = $responseDecoded['description'];
	
	$seo_thumb = $main_thumb;

	for ($i=0; $i < $count_images; $i++) { 

		$thumb = $arr_images[$i]['image'];

		$file = pathinfo($thumb,PATHINFO_FILENAME);
		
		$ext = pathinfo($thumb, PATHINFO_EXTENSION);

		$buffer_carousel .= '
			<a href="'. $thumb .'" class="popup-image" rel="gallery">
				<img src="'. $thumb .'" class="full" alt=""/>
			</a>';

		if ($i<=5) {
			$buffer_images_print .= '
				<div style="float: right; width: 50%;">
					<img src="'. $thumb .'" class="full" style="display: block; width: 100%; height: 200px; object-fit: cover; border: 2px solid white;"/>
				</div>';
		}
	}

	if ($count_images==0) {
		$buffer_carousel = '<img src="images/thumb_default.jpg" class="full" alt=""/>';
		$buffer_images_print = '<img src="images/thumb_default.jpg" class="full" alt=""/>';
	}

?> 

<!DOCTYPE html>
<html lang="es">
 <head>
    <title><?php echo $address; ?> | Curto Propiedades</title>
    
    <?php include('inc/head.php'); ?>

    <?php include('inc/head_seo2.php'); ?>

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
  	
  	<div class="hide-print">
		<?php include('inc/header.php'); ?>
	</div>
	 
	<div class="wrapper wrapper-pd-t print-pd-t-0">

		<section id="propiedades">
			
			<div class="pd-v-xlg hide-print">
				<div class="container">
					<div class="row">
						<div class="col-sm-9 print-w-100 border-r border-hide-xs print-bd-0">
							<?php echo $reservado; ?>
							<div class="row">
								<div class="col-md-6">
									<h1 class="propiedades-detail-subtitle font-1 color-4 text-ucase pull-left"><?php echo $responseDecoded['address'];?> <?php echo $responseDecoded['location']['name']; ?></h1>
									<ul class="propiedades-actions pull-right">
										<?php if($geoLat!='' && $geoLong!='') { ?>
										<li>
											<a href="http://maps.google.com/maps?q=loc:<?php echo $geoLat; ?>,<?php echo $geoLong; ?>" target="_blank">
												<i class="fa fa-map-marker fa-fw"></i>
											</a>
										</li>
										<?php } ?>
										<li><a href="#" class="btn-print"><i class="fa fa-print fa-fw"></i></a></li>
										<li>
											<a href="#" class="subnav-toggle"><i class="fa fa-share-alt fa-fw"></i></a>
											<ul class="social-subnav">
												<li>
													<a 
														href="#" 
														data-propiedad_id="<?php echo $obj->id; ?>"
														data-propiedad_titulo="<?php echo $obj->titulo_es; ?>"
														data-toggle="modal" 
														data-target="#modal-compartir">
															<i class="fa fa-envelope-o fa-fw"></i>
													</a>
												</li>
												<li>
													<a href="https://twitter.com/intent/tweet?text=Curto Propiedades - <?php echo(utf8_encode($obj->titulo_es)); ?>&amp;url=<?php echo ($static_url .'propiedad/'. $obj->id); ?>" target="_blank">
														<i class="fa fa-twitter fa-fw"></i>
													</a>
												</li>
												<li>
													<a href="http://www.facebook.com/sharer.php?u=<?php echo($static_url .'propiedad/'. $obj->id); ?>" target="_blank">
														<i class="fa fa-facebook fa-fw"></i>
													</a>
												</li>
												<li>
													<a href="https://plus.google.com/share?url=<?php echo($static_url .'propiedad/'. $obj->id); ?>&amp;t=Curto Propiedades - <?php echo($obj->titulo_es); ?>" target="_blank">
														<i class="fa fa-google-plus fa-fw"></i>
													</a>
												</li>
												<li>
													<a href="https://pinterest.com/pin/create/button/?url=<?php $static_url .'propiedad/'. $obj->id; ?>&media=<?php echo($static_url.$main_thumb); ?>&description=<?php echo('Curto Propiedades' .' - '. $oObj->descripcion_es); ?>" target="_blank">
														<i class="fa fa-pinterest fa-fw"></i>
													</a>
												</li>
											</ul>
										</li>
									</ul>
									<div class="clearfix"></div>
									<hr class="gray mg-b mg-t"/>
									<div class="carousel has-nav mg-b">
										<?php echo $buffer_carousel; ?>
									</div>
									<?php echo $buffer_360; ?>
									<div class="item-info pull-left">
										<?php if ($responseDecoded['type']['name'] | !$responseDecoded['type']['name'] == '') { ?>
										<span class="text-ucase"><?php echo $responseDecoded['type']['name'];?></span>
										<?php } ?>

										<?php if($responseDecoded['operations'][0]['operation_type'] | !$responseDecoded['operations'][0]['operation_type']=='') { ?>
										<span class="text-ucase"><?php echo $responseDecoded['operations'][0]['operation_type']; ?></span>
										<?php } ?>
										
										<?php if($responseDecoded['location']['name'] | !$responseDecoded['location']['name']=='') { ?>
										<span class="text-ucase"><?php echo $responseDecoded['location']['name']; ?></span>
										<?php } ?>

										<?php if($responseDecoded['reference_code'] | !$responseDecoded['reference_code']=='') { ?>
										<span class="text-ucase">Cod.: <?php echo $responseDecoded['reference_code'] ?></span>
										<?php } ?>

										<?php if($responseDecoded['id'] | !$responseDecoded['id']==0) { ?>
										<span class="text-ucase">ID.: <?php echo $responseDecoded['id']; ?></span>
										<?php } ?>
									</div>
							
									<div class="clearfix"></div>
									<hr class="gray mg-b mg-t"/>
									<a href="#" class="propiedades-detail-back hide-print"><i class="fa fa-angle-left fa fw"></i> <?php echo $t['prp']['16']; ?></a>
								</div>
								<div class="col-md-5">
									<div class="propiedades-detail-desc">
										<h4 class="propiedades-detail-subtitle font-1 color-4 mg-b mg-lg-t-xs-xs"><?php echo $t['prp']['17']; ?></h4>
										<article>
										 <?php echo $responseDecoded['description'] ?>
										</article>
										<h4 class="propiedades-detail-subtitle font-1 color-4 mg-b mg-lg-t"><?php echo $t['prp']['18']; ?></h4>
										<ul class="mg-lg-b-xs-xs">
											<?php if($responseDecoded['type']['name'] | !$responseDecoded['type']['name']==""){?>
											<li>
												<i class="icon-icon7"></i>
												<span class="caption"><?php echo $responseDecoded['type']['name']?></span>
											</li>
											<?php } ?>
											<?php if($responseDecoded['operations'][0]['prices'][0]['price'] | !$responseDecoded['operations'][0]['prices'][0]['price']==0){?>
											<li>
												<i class="icon-icon9"></i>
												<span class="caption"><?php echo$responseDecoded['operations'][0]['operation_type'].': '.$result.' '.$valueThePriceReplace?></span>
											</li>
											<?php } ?>
											<?php if($responseDecoded['roofed_surface'] | !$responseDecoded['roofed_surface']=="0.00"){?>
											<li>
												<i class="icon-icon19"></i>
												<span class="caption"><?php echo $responseDecoded['roofed_surface']?>m² <?php echo $t['prp']['20']?></span>
											</li>
											<?php } ?>
											<?php if($responseDecoded['total_surface'] | !$responseDecoded['total_surface']=="0.00"){?>
											<li>
												<i class="icon-icon19"></i>
												<span class="caption"><?php echo $responseDecoded['total_surface'] ?>m² <?php echo $t['prp']['19']?></span>
											</li>
											<?php } ?>
											<?php if($responseDecoded['room_amount'] | !$responseDecoded['room_amount']==0){?>
											<li>
												<i class="icon-icon23"></i>
												<span class="caption"><?php echo $responseDecoded['room_amount'];?> <?php echo $t['prp']['21']?></span>
											</li>
											<?php } ?>
											<?php if($responseDecoded['toilet_amount'] | !$responseDecoded['toilet_amount']==0){?>
											<li>
												<i class="icon-icon18"></i>
												<span class="caption"><?php echo $responseDecoded['toilet_amount'];?> <?php echo $t['prp']['22'];?></span>
											</li>
											<?php } ?>
											<?php if($responseDecoded['parking_lot_amount'] | !$responseDecoded['parking_lot_amount']==0){?>
											<li>
												<i class="icon-icon8"></i>
												<span class="caption"><?php echo $responseDecoded['parking_lot_amount'];?> <?php echo $t['prp']['23']; ?></span>
											</li>
											<?php } ?>
											<?php if ($responseDecoded['age'] | !$responseDecoded['age']==0){?> 
											<li>
												<i class="icon-icon6"></i>
												<span class="caption"><?php echo $t['prp']['35']?>: <?php echo $responseDecoded['age'];?></span>
											</li>
											<?php } ?>

										</ul>
									</div>
								</div>	
							</div>
						</div>
						<div class="col-sm-3">
							<?php 
							
							if($valueThePriceReplace==0) {
								$precio_venta = '';
							} else {
								// En venta:
								$precio_venta = $t['prp']['25'] .' '.$result.' '.$valueThePriceReplace.'<br>';
							}

							if($valueThePriceReplaceAr==0) {
								$precio_alquiler = '';
							} else {
								// En alquiler:
								$precio_alquiler = $t['prp']['26'].' '.$resultAr.' '.$valueThePriceReplaceAr.'<br>';
							}

							$precio = $precio_venta .' '. $precio_alquiler;

							if ($precio=='') {
								// Consultar:
								$precio = $t['prp']['27'];
							}

							?>

							<?php if($typeTheCurrecyAr !== null){ ?>
                                <p class="price large font-3 color-5"><?= $valueTheOperationR.': '.$resultAr.' '.$valueThePriceReplaceAr; ?>
                                </p>
                                <?php } ?>
                                <?php if($typeTheCurrecy !== null){ ?>
                                <p class="price large font-3 color-5 mg-lg-b"><?= $valueTheOperationS.': '. $result.' '.$valueThePriceReplace; ?>
                                </p>
                            <?php } ?>

							<a href="#" class="btn btn-color2-bg small full mg-b" data-toggle="modal" data-target="#modal-me-interesa"><?php echo $t['prp']['28']; ?></a>
							<?php echo $client_fav; ?>
						</div>
					</div>
				</div>
			</div>

			<div class="show-print">
				<div class="mg-lg-b">
					<img src="assets/images/logo.svg" class="pull-left" style="width: 45px; margin-right: 30px;">
					<p class="pull-left">
						Vicente López 515 - Piso 2 - Of. 1 y 4 <br>
						Monte Grande - Prov. Buenos Aires - Argentina<br>
						Tel. 5263-9039 - (+54 9 11) 6296-4168<br>
						alquileres@curtopropiedades.com - ventas@curtopropiedades.com
					</p>
					<div class="clearfix"></div>
				</div>
				<div class="row">
					<div class="col-xs-5">
						<?php echo $buffer_images_print; ?>
						<div class="clearfix"></div>
					</div>
					<div class="col-xs-7">
						<div class="propiedades-detail-desc">
							<?php echo $reservado; ?>
							<h1 class="propiedades-detail-subtitle font-1 color-4 text-ucase mg-b"><?php echo $titulo; ?></h1>
							<p class="large font-3 color-5 mg-b"><?php echo $precio; ?></p>
							<h4 class="propiedades-detail-subtitle font-1 color-4 mg-b"><?php echo $t['prp']['17']; ?></h4>
							<article>
								<?php echo strip_tags($descripcion,'<strong>,<b>,<i>,<em>,<br>,<p>,<a>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>'); ?>
							</article>
							<h4 class="propiedades-detail-subtitle font-1 color-4 mg-b mg-lg-t"><?php echo $t['prp']['18']; ?></h4>
							<ul class="mg-lg-b-xs-xs">
								<?php if(ret_refchilds_tipo_propiedad($dbh, $obj->tipo_propiedad)!='') { ?>
								<li>
									<i class="icon-icon7"></i>
									<span class="caption"><?php echo ret_refchilds_tipo_propiedad($dbh, $obj->tipo_propiedad); ?></span>
								</li>
								<?php } ?>
								<?php if($obj->precio_venta>0) { ?>
								<li>
									<i class="icon-icon9"></i>
									<span class="caption"><?php echo $t['prp']['25']; ?>  <?php echo ret_refchilds_name($dbh, $obj->moneda_venta_id) .' '. number_format($obj->precio_venta,0,",","."); ?></span>
								</li>
								<?php } ?>
								<?php if($responseDecoded['roofed_surface'] | !$responseDecoded['roofed_surface']=="0.00"){?>
									<li>
										<i class="icon-icon19"></i>
										<span class="caption"><?php echo $responseDecoded['roofed_surface']?>m² <?php echo $roofedSurface?></span>
									</li>
								<?php } ?>
								<?php if($responseDecoded['total_surface'] | !$responseDecoded['total_surface']=="0.00"){?>
									<li>
										<i class="icon-icon19"></i>
										<span class="caption"><?php echo $responseDecoded['total_surface'] ?>m² <?php echo $surfaceTotal?></span>
									</li>
								<?php } ?>
								<?php if($responseDecoded['room_amount'] | !$responseDecoded['room_amount']==0){?>
									<li>
										<i class="icon-icon23"></i>
										<span class="caption"><?php echo $responseDecoded['room_amount'];?> <?php echo $roomAmount?></span>
									</li>
								<?php } ?>
								<?php if($responseDecoded['toilet_amount'] | !$responseDecoded['toilet_amount']==0){?>
									<li>
										<i class="icon-icon18"></i>
										<span class="caption"><?php echo $responseDecoded['toilet_amount'];?> <?php echo $toiletAmount?></span>
									</li>
								<?php } ?>
								<?php if($responseDecoded['parking_lot_amount'] | !$responseDecoded['parking_lot_amount']==0){?>
									<li>
										<i class="icon-icon8"></i>
										<span class="caption"><?php echo $responseDecoded['parking_lot_amount'];?><?php echo $parkingLotAmount; ?></span>
									</li>
								<?php } ?>
								<?php if ($responseDecoded['age'] | !$responseDecoded['age']==0){?> 
									<li>
										<i class="icon-icon6"></i>
										<span class="caption"><?php echo $ambiguity ?>: <?php echo $responseDecoded['age']?></span>
									</li>
								<?php } ?>
							</ul>
						</div>
					</div>
				</div>
			</div>

		</section>
		
		<div class="hide-print">
			<section id="modal-360" class="modal fade">
				<div class="modal-dialog modal-lg">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><i class="fa fa-times fa-lg"></i></button>
							<h4 class="modal-title title-md">Imágen 360º</h4>
						</div>
						<div class="modal-body">
							<div id="360img" class="mg-b" style="width: 100%; height: 400px;"></div>
						</div>
					</div>
				</div>
			</section>
		</div>
		
	</div>

	<div class="hide-print">
		<?php include('inc/footer.php'); ?>
	</div>

	<script type="text/javascript">

		$(function(){

			$('#nav-main a.propiedades').addClass('active');

			$('#modal-360').on('shown.bs.modal',function(event){
				var button = $(event.relatedTarget);
				var image360URL = button.data('image360-url');
				var div = document.getElementById('360img');
				var PSV = new PhotoSphereViewer({
					panorama: image360URL,
					container: div,
					time_anim: 3000,
					navbar: true,
					navbar_style: {
						backgroundColor: 'rgba(58, 67, 77, 0.7)'
					},
				});
			});


			$('.btn-print').click(function(){
				window.print();
				return false;
			});


			$('.social-subnav').fadeOut(0);
			$('.propiedades-actions .subnav-toggle').click(function(){
				if ($('.social-subnav').is(':visible')) {
					$('.social-subnav').fadeOut();
				} else {
					$('.social-subnav').fadeIn();
				}
				return false;
			});


			<?php if ($count_images>1) { ?>
			$('.carousel').owlCarousel({
				autoplay: true,
				autoplayHoverPause: true,
				autoHeight: true,
			    loop: true,
			    dots: true,
			    nav: true,
			    navText: ['',''],
	            items: 1,
	            margin: 0,
	            responsive: {
	            	0: {
	            		nav: false
	            	},
	            	990: {
	            		nav: true
	            	}
	            }
			});
			<?php } ?>


			$('.propiedades-detail-back').click(function(){
				history.back(1);
				return false;
			});

		});

	</script>

</body>
</html>
