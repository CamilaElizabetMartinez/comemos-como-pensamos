<?php
    error_reporting(E_ERROR | E_WARNING | E_PARSE);
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
	$operationType  = $_GET['tipo_operacion'];
	$propertyType = $_GET['tipo_propiedad'];
	$idZone = $_GET['id_zona'];
	$typeZone = $_GET['tipo_zona'];

    if($operationType == 'all'){
        $operationType = [1,2,3];
    }

    if($propertyType == 'all'){
        $propertyType = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
    }

	$objectData = new stdClass();

	$objectData-> current_localization_id = [$idZone];
	$objectData-> current_localization_type = $typeZone;
	$objectData-> price_from = '0';
	$objectData-> price_to = '99999999';
	$objectData-> operation_types = $operationType;
	$objectData-> property_types = $propertyType;

	$objectDataEncoded= json_encode($objectData);
	$objectDataEncodedUrl  = urlencode($objectDataEncoded);
    
	$data = curl_init();

    $numberPage = isset($_GET['pagina']) ? $_GET['pagina'] : 1;
    $propertiesForPage= 10;
    $offset = ($numberPage-1)* $propertiesForPage;
	$urlApiTokko= 'http://www.tokkobroker.com/api/v1/property/search/?lang=es_ar&format=json&order_by=price&order=ASC&limit=10&offset='.$offset.'&data=';
	$key= '&key=4fbfb1318c148749d76fa87803fcb5ed83620e7f' ;
	$requestUrl = $urlApiTokko.$objectDataEncodedUrl.$key;
    
	curl_setopt($data, CURLOPT_URL, $requestUrl);
    
	curl_setopt($data, CURLOPT_RETURNTRANSFER, true);
    
	curl_setopt($data, CURLOPT_HEADER, 0);
    
    $response = curl_exec($data);
    $responseDecoded = json_decode($response, true);
    $objects = $responseDecoded['objects'];
    $totalCount = $responseDecoded['meta']['total_count'];

	curl_close($data);
?>

<?php
    $url = 'buscar-propiedades';

    $permit = '';

    $pathRoot = '';

    require_once($pathRoot . 'inc/common.php');

    require_once($pathRoot . 'lib/cls/cls.propiedad.php');

    /*--------------------------------------------------------------*/
    // LANG:
    /*--------------------------------------------------------------*/

    if (!isset($_REQUEST['lang']) or $_REQUEST['lang']=='') {
        $lang = 'es';
    } else {
        $lang = $_REQUEST['lang'];
    }

    require_once('lang/'. $lang .'/lang.php');

    // Armo sidebar de filtros:

    if ($fltr_op_slug!='todas') {
    	$buffer_terms .= '<li><strong>'. $fltr_op_name .'</strong></li>';
    	$buffer_filtros .= '
    		<li>
    			<span>
    				<i class="icon-icon3"></i>&nbsp;'. $fltr_op_name .'
    				<a href="propiedades/'. $lang .'/tipo-operacion/todas/tipo-propiedad/'. $fltr_prop_slug .'/zona/'. $fltr_zona_slug .'/pagina/1" class="close"><i class="fa fa-times fa-fw"></i></a>
    			</span>
    		</li>';
    }

    if ($fltr_prop_slug!='todas') {
    	$buffer_terms .= '<li><strong>'. $fltr_prop_name .'</strong></li>';
    	$buffer_filtros .= '
    		<li>
    			<span>
    				<i class="icon-icon7"></i>&nbsp;'. $fltr_prop_name .'
    				<a href="propiedades/'. $lang .'/tipo-operacion/'. $fltr_op_slug .'/tipo-propiedad/todas/zona/'. $fltr_zona_slug .'/pagina/1" class="close"><i class="fa fa-times fa-fw"></i></a>
    			</span>
    		</li>';
    }

    if ($fltr_zona_slug!='todas') {
    	$buffer_terms .= '<li><strong>'. $fltr_zona_name .'</strong></li>';
    	$buffer_filtros .= '
    		<li>
    			<span>
    				<i class="icon-icon7"></i>&nbsp;'. $fltr_zona_name .'
    				<a href="propiedades/'. $lang .'/tipo-operacion/'. $fltr_op_slug .'/tipo-propiedad/'. $fltr_prop_slug .'/zona/'. $fltr_zona_slug .'/pagina/1" class="close"><i class="fa fa-times fa-fw"></i></a>
    			</span>
    		</li>';
    }

    /*-------------------------------------------------------------------------------------------------------------------------------*/

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Antes de subir a produccion dejar en el atributo href la siguiente ruta: assets/css/main.css  -->
    <link rel="stylesheet" type="text/css" href="/curto-propiedades/assets/css/main.css" />
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
    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=336608014017160&ev=PageView&noscript=1"/></noscript>
    <!-- End Facebook Pixel Code -->

</head>

<body>
	<?php include('inc/header.php'); ?>

	<div class="wrapper wrapper-pd-t">
		<section id="propiedades">
			<div class="pd-v-xlg">
				<div class="container">
					<div class="row">
						<div class="col-sm-4 col-md-3">
							<div class="sidebar mg-lg-b-xs-xs">
								<p class="font-1 text-center color-4"><?php echo $t['prp']['12']; ?></p>
								<hr class="white mg-b mg-t"/>
								<form id="form-propiedades-search" action="propiedades-list.php" method="GET" enctype="multipart/form-data">

                                    <?php
                                        $valuesOfTypeOperation = [
                                            'all' => $t['prp']['0'],
                                            '1'=> $t['prp']['46'],
                                            '2'=> $t['prp']['47'],
                                            '3'=> $t['prp']['48'],
                                        ];
                                    ?>

									<div class="form-group">
										<label class="font-1 color-4"><?php echo $t['prp']['2']; ?></label>
										<select id="tipo-operacion" name="tipo_operacion" class="form-control" required="true">
                                            <?php foreach ($valuesOfTypeOperation as $key => $value) : ?>
                                                <option value="<?php echo $key?>"<?php echo ($key ==  $operationType) ? 'selected' : '';?>><?php echo $value?></option>
                                            <?php endforeach; ?>
										</select>
									</div>

                                    <?php
            							$valuesOfTypeProperty = [
            							    'all' => $t['prp']['0'],
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
                                        <label class="font-1 color-4"><?php echo $t['prp']['3']; ?></label>
                                        <select id="tipo-propiedad" name="tipo_propiedad" class="form-control">
                                            <?php foreach ($valuesOfTypeProperty as $key => $value) : ?>
                                                <option value="<?php echo $key?>"<?php echo ($key == $propertyType) ? 'selected' : '';?>><?php echo $value?></option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>

                                    <div class="form-group mg-b-xs-xs">
                                        <label class="font-1 color-4"><?php echo $t['prp']['4']; ?></label>
                                        <input type="text" id="zona" name="zona" list="suggestions" class="form-control typeahead" placeholder="<?php echo $t['prp']['4']; ?>" value="<?php echo $typeZone ?>">
                                        <datalist class="options-datalist" id="suggestions">
                                            <?php foreach ($objectsByLocation as $key => $value) : ?>
                                                <option value="<?php echo $value['location_name'];?>" data-target-option-list="<?php echo $value['location_id'];?>" <?php echo ($value['location_id']) ? 'selected' : '';?>><?php echo $value['location_name'];?></option>
                                            <?php endforeach; ?>
                                        </datalist>
                                        <input type="hidden" id="id-zona" name="id_zona" class="form-control typeahead" placeholder="<?php echo $t['prp']['4']; ?>" autocomplete="off">
                                    </div>
								</form>
							</div>
						</div>
						<div class="col-sm-8 col-md-9">
							<div class="results mg-lg-b color-4 font-1">

								<?php if ($totalCount>1 || $totalCount==0) { ?>
								<span><?php echo $totalCount; ?> <?php echo $t['prp']['13']; ?></span>
								<?php } else { ?>
								<span><?php echo $totalCount; ?> <?php echo $t['prp']['14']; ?></span>
								<?php } ?>
                                <?php $string = ' /';?>
								<?php if ($buffer_terms!='') { ?>
								<ul class="results-terms">
									<li><?php echo $t['prp']['15']; ?></li>
                                    <li>
                                    <?php switch ($operationType) {
                                	case '1':
                                		echo $t['prp']['46'].$string;
                                		break;
                                	case '2':
                                		echo $t['prp']['47'].$string;
                                		break;
                                    case '3':
                                        echo $t['prp']['48'].$string;
                                        break;
                                    }
                                    ?>
                                    </li>

                                    <li>
                                    <?php switch ($propertyType) {
                                        case '1':
                                            echo $t['prp']['39'];
                                            break;
                                        case '2':
                                            echo $t['prp']['37'].$string;
                                            break;
                                	    case '3':
                                	    	echo $t['prp']['36'].$string;
                                	    	break;
                                        case '4':
                                            echo $t['prp']['49'].$string;
                                            break;
                                        case '5':
                                            echo $t['prp']['40'].$string;
                                            break;
                                        case '7':
                                            echo $t['prp']['38'].$string;
                                            break;
                                        case '9':
                                            echo $t['prp']['43'].$string;
                                            break;
                                        case '10':
                                            echo $t['prp']['44'].$string;
                                            break;
                                        case '14':
                                            echo $t['prp']['42'].$string;
                                            break;
                                        case '24':
                                            echo $t['prp']['41'].$string;
                                           break;
                                        case '13':
                                            echo $t['prp']['45'].$string;
                                            break;
                                        }
                                    ?>
                                    </li>
                                    <li><?php echo $typeZone; ?></li>
                                </ul>
                                <?php } ?>
							</div>
							<?php echo $buffer; ?>
							<nav>
								<ul class="pagination text-center">
									<?php echo $buffer_paging; ?>
								</ul>
							</nav>

                            <?php foreach ($objects as $array => $value) :?>
                                <?php     
                                    $valueRoofedSurFace = $value['roofed_surface'];
                                    $valueSurFaceMeasurement = 'm²';
                                    $valueRoomAmount = $value['room_amount'];
                                    $valueBathroomAmount = $value['bathroom_amount'];
                                    $idTheProperty = $value['id'];
                            
                                    $parameterWithKey = 'propiedades-detail.php?id=';

                                    $valueThePriceUSD = $value['operations'][0]['prices'][0]['price'];
                                    $valueThePriceAr = $value['operations'][1]['prices'][0]['price'];

                                    $typeTheCurrecyUSD = $value['operations'][0]['prices'][0]['currency'];
                                    $typeTheCurrecyAr = $value['operations'][1]['prices'][0]['currency'];
                                    $replacedTypeTheCurrecyAr = str_replace("S","$", $typeTheCurrecyAr);
                                    $replacedTypeTheCurrecyUSD = str_replace("S","$", $typeTheCurrecyUSD);
                                    $valueThePriceFormattedUSD = number_format($valueThePriceUSD);
                                    $valueThePriceFormattedAr = number_format($valueThePriceAr);
                                    $valueThePriceReplacedAr = str_replace(",",".", $valueThePriceFormattedAr);
                                    $valueThePriceReplacedUSD = str_replace(",",".", $valueThePriceFormattedUSD);
                                    $typeTheOperationSale = $value['operations'][0]['operation_type'];
                                    $typeTheOperationRental = $value['operations'][1]['operation_type'];

                                    $numberTotalPages = ceil($totalCount / $propertiesForPage);
                                    $parameterPage = '&pagina=';
                                    
                                    if($operationType === '2' && $valueThePriceReplacedRental !== '0'){
                                        $valueThePriceReplaced = $valueThePriceReplacedRental;
                                    }
                                ?>

                                <div class="item mg-lg-b">

                                    <div class="row">
                                        <div class="item col-md-4">
                                            <a href="<?php echo$parameterWithKey.$idTheProperty?>">
                                                <div class="item-thumb fh1 mg-lg-b" style="background:url(<?php echo $value['photos'][0]['image']?>) center center no-repeat;"></div>
                                            </a>
                                        </div>
                                        <?php echo $objectsInverted['operations'][0]['operation_type']?><?php echo $objectsInverted['operations'][0]['prices'][0]['currency']?>
                                        <?php echo $objectsInverted['operations'][0]['prices'][0]['price']?>

                                        <div class="item col-md-5">
                                            <div class="item-caption mg-lg-b fh1">
                                                <a href="<?php echo$parameterWithKey.$idTheProperty?>">
                                                    <h3 class="item-title mg-b"><?php echo $value['location']['name']?>, <?php echo $value['address'] ?></h3>
                                                </a>
                                                <div class="item-desc"><?php echo $value['description'] ?></div>
                                                <div class="item-info mg-t">
                                                    <span class="text-ucase">
                                                        <?php
                                                            if ($valueRoofedSurFace | !$valueRoofedSurFace == "0.00") {
                                                                echo $valueRoofedSurFace.' '.$valueSurFaceMeasurement.' '.$t['prp']['20'].' '.'|';
                                                            }
                                                        ?>
                                                        <?php
                                                            if ($valueBathroomAmount | !$valueBathroomAmount == 0) {
                                                                echo $valueBathroomAmount.' '.$t['prp']['21'].' '.'|';
                                                            }
                                                        ?>
                                                        <?php
                                                            if ($valueRoomAmount | !$valueRoomAmount == 0) {
                                                                echo $valueRoomAmount.' '.$t['prp']['22'];
                                                            }
                                                        ?>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                            <div class="col-md-3">
                                                <div class="row">
                                                    <div class="col-md-12 col-sm-4">
                                                        <?php if($typeTheCurrecyUSD !== null){ ?>
                                                            <p class="price large font-3 color-5"><?= $replacedTypeTheCurrecyUSD.' '.$valueThePriceReplacedUSD; ?>
                                                            </p>
                                                        <?php } ?>
                                                        <?php if($typeTheCurrecyAr !== null){ ?>
                                                            <p class="price large font-3 color-5 mg-lg-b"><?= $replacedTypeTheCurrecyAr.' '.$valueThePriceReplacedAr; ?>
                                                            </p>
                                                        <?php } ?>

                                                    </div>

                                                    <div class="col-md-12 col-sm-4">
                                                            <a href="<?php echo$parameterWithKey.$idTheProperty?>" class="btn btn-color2-bg small full mg-b">Ver detalles</a>
                                                    </div>

                                                    <div class="col-md-12 col-sm-4">

                                                        <a href="#" class="btn btn-color2-bg small full" data-toggle="modal" data-target="#modal-login">Guardar</a>
                                                    </div>
                                                </div>
                                            </div>

                                    </div>
                                    <hr>
                                </div>
                            <?php endforeach; ?>

                            <div id="propiedades-paginador" style="display:flex; justify-content:center;" >
                                <?php
                                   
                                if ($numberPage > 1) {
                                    if($operationType == [1,2,3]){
                                        $operationType = 'all';
                                    }
                                
                                    if($propertyType == [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]){
                                        $propertyType = 'all';
                                    }
                                    echo '<div id="enlace-paginador" style="margin-left: 10px; margin-right: 10px"><a href="propiedades-list.php'.'?tipo_operacion='.$operationType.'&tipo_propiedad='.$propertyType.'&id_zona='.$idZone.'&tipo_zona='.$typeZone.$parameterPage.($numberPage - 1).'">Anterior</a></div>';
                                }
                                
                                for ($i = 1; $i <= $numberTotalPages; $i++) {
                                    if($operationType == [1,2,3]){
                                        $operationType = 'all';
                                    }
                                
                                    if($propertyType == [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]){
                                        $propertyType = 'all';
                                    }
                                    echo '<div id="enlace-paginador" style="margin-left: 10px; margin-right:10px"><a href="propiedades-list.php'.'?tipo_operacion='.$operationType.'&tipo_propiedad='.$propertyType.'&id_zona='.$idZone.'&tipo_zona='.$typeZone.$parameterPage.$i.'">' . $i . '</a></div> ';
                                }

                                if ($numberPage < $numberTotalPages) {
                                    if($operationType == [1,2,3]){
                                        $operationType = 'all';
                                    }
                                
                                    if($propertyType == [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]){
                                        $propertyType = 'all';
                                    }
                                    echo '<div id="enlace-paginador" style="margin-left: 10px; margin-right: 10px" ><a href="propiedades-list.php'.'?tipo_operacion='.$operationType.'&tipo_propiedad='.$propertyType.'&id_zona='.$idZone.'&tipo_zona='.$typeZone.$parameterPage.($numberPage + 1).'">Siguiente</a></div>';
                                }
                                ?>
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

			// Typehead:

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

			$('.typeahead').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			}, {
				name: 'zonas_dataset',
				source: substringMatcher(zonas_dataset)
			});

            const inputZona = document.querySelector("#zona");
			inputZona.addEventListener('input', e => {
				const inputIdZona = document.querySelector("#id-zona");
			 	const inputZona = document.querySelector("#zona");
				const optionsZona = document.getElementById('suggestions').childNodes;

				for(let i = 0; i < optionsZona.length; i++) {
					if(inputZona.value == optionsZona[i].innerText) {
						inputIdZona.value = optionsZona[i].dataset.targetOptionList;
						break;
					}
				}
			});

			const formSearch = document.querySelector('#form-propiedades-search');
			formSearch.addEventListener('change', formSubmit, false);

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
				let replacedEcondeString = encodedString.replace(/%20|\+/g, "+");
				let idOptionsZona = found.getAttribute('data-target-option-list');
				let idOptionsZonaString = idOptionsZona.toString();
				let url = "?tipo_operacion="+inputTipoOperacionValue+"&tipo_propiedad="+inputTipoPropiedadValue+"&id_zona="+idOptionsZonaString+"&tipo_zona="+replacedEcondeString
				window.location.replace('propiedades-list.php'+url);
			}
		});
		;

	</script>

    <!-- Google Tag Manager (noscript) -->
	<noscript>
		<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TCDCK7F" height="0" width="0" style="display:none;visibility:hidden"></iframe>
	</noscript>
	<!-- End Google Tag Manager (noscript) -->

</body>
</html>