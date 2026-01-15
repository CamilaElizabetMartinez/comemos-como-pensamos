<?php
	error_reporting(E_ERROR | E_WARNING | E_PARSE);
	// ini_set('display_errors', 'on');
	// error_reporting(E_ALL);
	$idTheProperty = $_GET['id'];

	$objectData = new stdClass();
	$objectData->id = $idTheProperty;

	$objectDataEncode = json_encode($objectData);
	$objectDataEncodeUrl = urlencode($objectDataEncode);

	$data = curl_init();

	$urlApiTokko = 'http://www.tokkobroker.com/api/v1/property/';
	$key = '/?lang=es_ar&format=json&key=4fbfb1318c148749d76fa87803fcb5ed83620e7f';
	$resquestUrl = $urlApiTokko . $idTheProperty . $key;

	curl_setopt($data, CURLOPT_URL, $resquestUrl);

	curl_setopt($data, CURLOPT_RETURNTRANSFER, true);

	curl_setopt($data, CURLOPT_HEADER, 0);

	$response = curl_exec($data);
	$responseDecoded = json_decode($response, true);
		curl_close($data);
$address = $responseDecoded['address'];
$typeTheCurrecy = $responseDecoded['operations'][0]['prices'][0]['currency'];
$typeTheCurrecyAr = $responseDecoded['operations'][1]['prices'][0]['currency'];
$result = str_replace("S", "$", $typeTheCurrecy);
$resultAr = str_replace("S", "$", $typeTheCurrecyAr);
$valueThePrice = $responseDecoded['operations'][0]['prices'][0]['price'];
$valueThePriceAr = $responseDecoded['operations'][1]['prices'][0]['price'];
$valueThePriceFormatted = number_format($valueThePrice);
$valueThePriceReplace = str_replace(",", ".", $valueThePriceFormatted);
$valueThePriceFormattedAr = number_format($valueThePriceAr);
$valueThePriceReplaceAr = str_replace(",", ".", $valueThePriceFormattedAr);
$valueTheOperationS = $responseDecoded['operations'][0]['operation_type'];
$valueTheOperationR = $responseDecoded['operations'][1]['operation_type'];
$geoLat = $responseDecoded['geo_lat'];
$geoLong = $responseDecoded['geo_long'];
$reference_code = $responseDecoded['reference_code'];
$fullLocation = $responseDecoded['location']['full_location'];
$parts = explode("|", $fullLocation);
$newFullLocaion = $parts[1] . " | " . $parts[2] . " | " . $parts[3];
$touperOperationS = strtoupper($valueTheOperationS);
$touperOperationR = strtoupper($valueTheOperationR);
$description = $responseDecoded['description'];
$mainPhoto = $responseDecoded['photos'][0]['image'];
$tags = $responseDecoded['tags'];
$typeName = $responseDecoded['type']['name'];
$surfaceTotal = $responseDecoded['total_surface'];
$semiroofedSurface = $responseDecoded['semiroofed_surface'];
$surface = $responseDecoded['surface'];
$quantityRoom = $responseDecoded['room_amount'];
$quantityToilet = $responseDecoded['bathroom_amount'];
$quantityTheParking = $responseDecoded['parking_lot_amount'];
$quantitySuite = $responseDecoded['suite_amount'];
$richDescription = $responseDecoded['rich_description'];
?>
<?php

$url = 'propiedad';

$permit = '';

$pathRoot = '';

require_once($pathRoot . 'inc/common.php');

/*--------------------------------------------------------------*/
// LANG:
/*--------------------------------------------------------------*/

if (!isset($_REQUEST['lang']) or $_REQUEST['lang'] == '') {
	$lang = 'es';
} else {
	$lang = $_REQUEST['lang'];
}

require_once('lang/' . $lang . '/lang.php');

/*--------------------------------------------------------------*/
// PROPIEDADES:
/*--------------------------------------------------------------*/

require_once($pathRoot . 'lib/cls/cls.propiedad.php');

$obj = new clsPropiedad();

if ($_REQUEST['id'] != '') {

	$obj->find($_REQUEST['id']);

	if ($_SESSION['cliente_id'] != '') {
		$client_fav = '<a href="#" class="add-fav btn btn-color2-bg small full" data-propiedad-id="' . $obj->id . '">' . $t['gui']['3'] . '</a>';
	} else {
		$client_fav = '<a href="#" class="btn btn-color2-bg small full" data-toggle="modal" data-target="#modal-login">' . $t['gui']['3'] . '</a>';
	}

	$url = 'propiedad/' . $obj->id;

	//---//

	if ($obj->estado_en_profit == 'R' or $obj->estado_en_profit == 'RESERVADO') {
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

for ($i = 0; $i < $count_images; $i++) {

	$thumb = $arr_images[$i]['image'];

	$file = pathinfo($thumb, PATHINFO_FILENAME);

	$ext = pathinfo($thumb, PATHINFO_EXTENSION);

	$buffer_carousel .= '
			<a href="' . $thumb . '" class="popup-image" rel="gallery">
				<img src="' . $thumb . '" class="full" alt=""/>
			</a>';

	if ($i<=5) {
		$buffer_images_print .= '
			<img src="'. $thumb .'" class="full" style="display: block; width: 35%; height: 150px;; object-fit: cover; border: 4px solid white;"/>
		';
	}
}

if ($count_images == 0) {
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

	<!-- Facebook Pixel -->
	<script type="text/plain" data-cookie-consent="targeting">
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
	<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=336608014017160&ev=PageView&noscript=1" /></noscript>
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
									<h1 class="propiedades-detail-subtitle font-1 color-4 text-ucase pull-left"><?php echo $responseDecoded['address']; ?> <?php echo $responseDecoded['location']['name']; ?></h1>
									<ul class="propiedades-actions pull-right">
										<?php if ($geoLat != '' && $geoLong != '') { ?>
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
													<a href="#" data-propiedad_id="<?php echo $idTheProperty; ?>" data-propiedad_titulo="<?php echo $titlePublication; ?>" data-toggle="modal" data-target="#modal-compartir">
														<i class="fa fa-envelope-o fa-fw"></i>
													</a>
												</li>
												<li>
													<a href="https://twitter.com/intent/tweet?text=Curto Propiedades - <?php echo $titlePublication; ?>&amp;url=<?php echo ($static_url . 'propiedad/' . $idTheProperty); ?>" target="_blank">
														<i class="fa fa-twitter fa-fw"></i>
													</a>
												</li>
												<li>
													<a href="http://www.facebook.com/sharer.php?u=<?php echo ($static_url . 'propiedad/' . $idTheProperty); ?>" target="_blank">
														<i class="fa fa-facebook fa-fw"></i>
													</a>
												</li>
												<li>
													<a href="https://plus.google.com/share?url=<?php echo ($static_url . 'propiedad/' . $idTheProperty); ?>&amp;t=Curto Propiedades - <?php echo $titlePublication; ?>" target="_blank">
														<i class="fa fa-google-plus fa-fw"></i>
													</a>
												</li>
												<li>
													<a href="https://pinterest.com/pin/create/button/?url=<?php $static_url . 'propiedad/' . $idTheProperty; ?>&media=<?php echo ($static_url . $main_thumb); ?>&description=<?php echo ('Curto Propiedades' . ' - ' . $obj->descripcion_es); ?>" target="_blank">
														<i class="fa fa-pinterest fa-fw"></i>
													</a>
												</li>
											</ul>
										</li>
									</ul>
									<div class="clearfix"></div>
									<hr class="gray mg-b mg-t" />
									<div class="carousel has-nav mg-b">
										<?php echo $buffer_carousel; ?>
									</div>
									<?php echo $buffer_360; ?>
									<div class="item-info pull-left">
										<?php if ($responseDecoded['type']['name'] != '') { ?>
											<span class="text-ucase"><?php echo $responseDecoded['type']['name']; ?></span>
										<?php } ?>

										<?php if ($responseDecoded['operations'][0]['operation_type'] != '') { ?>
											<span class="text-ucase"><?php echo $responseDecoded['operations'][0]['operation_type']; ?></span>
										<?php } ?>

										<?php if ($responseDecoded['location']['name'] != '') { ?>
											<span class="text-ucase"><?php echo $responseDecoded['location']['name']; ?></span>
										<?php } ?>

										<?php if ($responseDecoded['reference_code'] != '') { ?>
											<span class="text-ucase">Cod.: <?php echo $responseDecoded['reference_code'] ?></span>
										<?php } ?>

										<?php if ($responseDecoded['id'] != 0) { ?>
											<span class="text-ucase">ID.: <?php echo $responseDecoded['id']; ?></span>
										<?php } ?>
									</div>

									<div class="clearfix"></div>
									<hr class="gray mg-b mg-t" />
									<a href="#" class="propiedades-detail-back hide-print"><i class="fa fa-angle-left fa fw"></i> <?php echo $t['prp']['16']; ?></a>
								</div>
								<div class="col-md-5">
									<div class="propiedades-detail-desc">
										<h4 class="propiedades-detail-subtitle font-1 color-4 mg-b mg-lg-t-xs-xs"><?php echo $t['prp']['17']; ?></h4>
										<article>
											<?php echo $richDescription; ?>
										</article>
										<h4 class="propiedades-detail-subtitle font-1 color-4 mg-b mg-lg-t"><?php echo $t['prp']['18']; ?></h4>
										<ul class="mg-lg-b-xs-xs">
											<?php if ($responseDecoded['operations'][0]['prices'][0]['price'] != 0) { ?>
												<li>
													<i class="icon-icon9"></i>
													<span class="caption"><?php echo $responseDecoded['operations'][0]['operation_type'] . ': ' . $result . ' ' . $valueThePriceReplace ?></span>
												</li>
											<?php } ?>

											<li>
												<?php if($surfaceTotal != "0.00"){ ?>
														<i class="icon-icon19"></i>
														<span class="caption"><?php echo $surfaceTotal?>m² <?php echo $t['prp']['19'] ?></span>
                                                    <?php } ?>
												</li>
												<li>
													<?php if($responseDecoded['roofed_surface'] != "0.00"){ ?>
														<i class="icon-icon19"></i>
														<span class="caption"><?php echo $responseDecoded['roofed_surface'] ?>m² <?php echo $t['prp']['20'] ?></span>
                                                    <?php } ?>
												</li>

											<?php if ($responseDecoded['room_amount'] != 0) { ?>
												<li>
													<i class="icon-icon23"></i>
													<span class="caption"><?php echo $responseDecoded['room_amount']; ?> <?php echo $t['prp']['21'] ?></span>
												</li>
											<?php } ?>

											<?php if ($responseDecoded['toilet_amount'] != 0) { ?>
												<li>
													<i class="icon-icon18"></i>
													<span class="caption"><?php echo $responseDecoded['toilet_amount']; ?> <?php echo $t['prp']['22']; ?></span>
												</li>
											<?php } ?>

											<?php if ($responseDecoded['parking_lot_amount'] != 0) { ?>
												<li>
													<i class="icon-icon8"></i>
													<span class="caption"><?php echo $responseDecoded['parking_lot_amount']; ?> <?php echo $t['prp']['23']; ?></span>
												</li>
											<?php } ?>

											<li>
												<i class="icon-icon6"></i>
												<span class="caption"><?php echo $t['prp']['35'] ?>:
													<?php
													if ($responseDecoded['age'] == -1) {
														echo 'En construcción';
													} elseif ($responseDecoded['age'] == 0) {
														echo 'A estrenar';
													} elseif ($responseDecoded['age'] > 0) {
														echo $responseDecoded['age'].' año/s';
													}
													?>
												</span>
											</li>
											
											<?php if ($responseDecoded['type']['name'] != "") { ?>
												<li>
													<i class="icon-icon7"></i>
													<span class="caption"><?php echo $responseDecoded['type']['name'] ?></span>
												</li>
											<?php } ?>
										</ul>
									</div>
								</div>
							</div>
						</div>
						<div class="col-sm-3">
							<?php

							if ($valueThePriceReplace == 0) {
								$precio_venta = '';
							} else {
								// En venta:
								$precio_venta = $t['prp']['25'] . ' ' . $result . ' ' . $valueThePriceReplace . '<br>';
							}

							if ($valueThePriceReplaceAr == 0) {
								$precio_alquiler = '';
							} else {
								// En alquiler:
								$precio_alquiler = $t['prp']['26'] . ' ' . $resultAr . ' ' . $valueThePriceReplaceAr . '<br>';
							}

							$precio = $precio_venta . ' ' . $precio_alquiler;

							if ($precio == '') {
								// Consultar:
								$precio = $t['prp']['27'];
							}

							?>

							<?php if ($typeTheCurrecyAr !== null) { ?>
								<p class="price large font-3 color-5"><?= $valueTheOperationR . ': ' . $resultAr . ' ' . $valueThePriceReplaceAr; ?>
								</p>
							<?php } ?>
							<?php if ($typeTheCurrecy !== null) { ?>
								<p class="price large font-3 color-5 mg-lg-b"><?= $valueTheOperationS . ': ' . $result . ' ' . $valueThePriceReplace; ?>
								</p>
							<?php } ?>

							<a href="#" class="btn btn-color2-bg small full mg-b" data-toggle="modal" data-target="#modal-me-interesa"><?php echo $t['prp']['28']; ?></a>
							<?php echo $client_fav; ?>
						</div>
					</div>
				</div>
			</div>
		</section>
		<!-- <div class="containerSP show-print">
			<div id="wrapperHeadPDF" class="row">
				<div id="headLogoPDF">
					<img src="assets/images/logo.svg">
				</div>
				<div id="headInfoPDF">
					<p>CURTO PROPIEDADES</p>
					<p>Dir: Vicente López 515 - Piso 2 - Of. 1 y 4 -</p>
					<p>Monte Grande</p>
					<p>Telefono (011)5263-9039</p>
					<p>Celular (+54 9 11) 6296-4168</p>
					<p>www.curtopropiedades.com</p>
				</div>
			</div>
			<hr class="gray mg-b mg-t">
			<div id="wrapperPDF" class="row">
				<div class="contenedorpadre" id="titlePDF">
					<div id="wrapperLocationAndOperation">
						<div id="wrapperLocation">
							<div>
								<p><?php echo $reference_code; ?> | <?php echo $typeName; ?></p>
							</div>
							<div>
								<h2><?php echo $address; ?></h2>
							</div>
							<div>
								<p><?php echo $newFullLocaion; ?></p>
							</div>
						</div>
						<div id="wrapperOperacionPrecio">
							<div id="operacionPrecio">
								<?php if ($typeTheCurrecy !== null) { ?>
									<div class="tipoOperacion">
										<?= $touperOperationS ?>
									</div>
									<div class="tipoPrecio">
										<div>
											<?= $result . $valueThePriceReplace; ?>
										</div>
									</div>
								<?php } ?>
							</div>
							<div id="operacionPrecio">
								<?php if ($typeTheCurrecyAr !== null) { ?>
									<div class="tipoOperacion">
										<?= $touperOperationR ?>
									</div>
									<div class="tipoPrecio">
										<?= $resultAr. $valueThePriceReplaceAr; ?>
									</div>
								</div>
								</div>
								<?php } ?>
							</div>
						</div>
					</div>
					<div id="mainPhoto">
						<div class="wrapperMainPhoto">
							<img src="<?php echo $mainPhoto; ?>"></img>
						</div>
					</div>
					<div id="wrapperDetailPDF">
						<div id="infoBasic">
								<h4>INFORMACION BASICA</h4>
								<hr class="gray mg-b mg-t">
								<div id="wrapperInfoBasic">
									<div class="col-4">
										<div>
											<p>Cantidad de ambientes: <?php echo $quantityRoom ?></p>
										</div>
										<div>
											<p>Cantidad de cocheras: <?php echo $quantityTheParking ?></p>
										</div>
									</div>
									<div class="col-4">
										<div>
											<p>Cantidad de habitaciones: <?php echo $quantitySuite ?></p>
										</div>
										<?php if ($tags['id'] == 51) {
											$responseTag = 'Si';
										} else {
											$responseTag = 'No';
										} ?>
										<div>
											<p>Pileta: <?php echo $responseTag ?> </p>
										</div>
									</div>
									<div class="col-4">
										<div>
											<p>Cantidad de baños: <?php echo $quantityToilet ?></p>
										</div>
										<?php if ($tags['id'] == 15) {
											$responseTag = 'Si';
										} else {
											$responseTag = 'No';
										} ?>
										<div>
											<p>Dependecias: <?php echo $responseTag ?></p>
										</div>
									</div>
								</div>
							</div>

							<div id="infoSurfaces">
								<h4>SUPERFICIES Y MEDIDAS</h4>
								<hr class="gray mg-b mg-t">
								<div class="col-12 wrapperInfoSurfaces">
									<div class="col-4">
										<p>Superficie cubierta: <?php echo $surfaceTotal ?>m²</p>
									</div>
									<div class="col-4">
										<p>Superficie semicubierta: <?php echo $semiroofedSurface ?>m²</p>
									</div>
									<div class="col-4">
										<p>Superficie: <?php echo $surface ?>m²</p>
									</div>
								</div>
							</div>

							<div id="infoEnvironment">
								<h4>AMBIENTES</h4>
								<hr>
								<div id="wrapperInfoEnvironment">
									<?php
									for ($i = 0; $i < 20; $i++) {
										if ($tags[$i]['type'] == 2) {
											echo '<p>' . $tags[$i]['name'] . '</p>';
										}
									};
									?>
								</div>
							</div>

							<div id="infoAdditional">
								<div>
									<h4>ADICIONALES</h4>
									<hr class="gray mg-b mg-t">
								</div>
								<div class="wrapperInfoAdditional">
									<?php
									for ($i = 0; $i < 20; $i++) {
										if ($tags[$i]['type'] == 3) {
											echo '<p>' . $tags[$i]['name'] . '</p>';
										}
									};
									?>
								</div>
							</div>

							<div id="infoDescription">
								<h4>DESCRIPCIÓN</h4>
								<hr class="gray mg-b mg-t">
								<div class="wrapperInfoDescription">
									<article>
										<?php echo $description; ?>
									</article>
								</div>
							</div>
							<div id="infoPhotos">
									<h4>FOTOS</h4>
									<hr class="gray mg-b mg-t">
								<div class=" col-xs-5 wrapperImages">
									<?php echo $buffer_images_print; ?>
								</div>
							</div>
							<hr>
							<div id="footerPDF">
								<p>Nota importante: Toda la información y medidas provistas son aproximadas y deberán ratificarse con la documentación pertinente y no compromete contractualmente a nuestra empresa. Los gastos (expensas, ABL) expresados refieren a la última información recabada y deberán confirmarse. Fotografias no vinculantes ni contractuales.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div> -->
	</div>

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
		$(function() {

				$('#nav-main a.propiedades').addClass('active');

				$('#modal-360').on('shown.bs.modal', function(event) {
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


				$('.btn-print').click(function() {
					window.print();
					return false;
				});


				$('.social-subnav').fadeOut(0);
				$('.propiedades-actions .subnav-toggle').click(function() {
					if ($('.social-subnav').is(':visible')) {
						$('.social-subnav').fadeOut();
					} else {
						$('.social-subnav').fadeIn();
					}
					return false;
				});


				<?php if ($count_images > 1) { ?>
					$('.carousel').owlCarousel({
						autoplay: true,
						autoplayHoverPause: true,
						autoHeight: true,
						loop: true,
						dots: true,
						nav: true,
						navText: ['', ''],
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


				$('.propiedades-detail-back').click(function() {
					history.back(1);
					return false;
				});

			});
		</script>

		<!-- Google Tag Manager (noscript) -->
		<noscript>
			<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TCDCK7F" height="0" width="0" style="display:none;visibility:hidden"></iframe>
		</noscript>
		<!-- End Google Tag Manager (noscript) -->

</body>

</html>