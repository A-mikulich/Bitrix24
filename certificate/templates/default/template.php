<?
use Edidata\Epl\User;
use Bitrix\Main\Web\Json;
use Bitrix\Main\Page\Asset;
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
    die(); ?>
<?php
/**
 * Bitrix vars
 *
 * @var array $arParams
 * @var array $arResult
 * @global CMain $APPLICATION
 */
Bitrix\Main\UI\Extension::load("ui.vue3");
Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/crypt/cadesplugin_api.js");
Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/crypt/crypto_plugin.js?" . time());
Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/base64js.min.js");
//\Bitrix\Main\Page\Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/jquery-3.7.0.min.js");
?>
<!--<script src="https://cdn.jsdelivr.net/npm/suggestions-jquery@22.6.0/dist/js/jquery.suggestions.min.js"></script>-->
<!--<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/suggestions-jquery@22.6.0/dist/css/suggestions.min.css">-->

<input id="upload" onchange="existsFile(event)" type="file" accept=".cer" style="display:none"/>

<div class="modal fade" id="loadList" tabindex="-1" aria-labelledby="loadListLabel" aria-hidden="true" data-show='true'>
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Список сертификатов</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">


                <input type="text" placeholder="Поиск по ФИО или серийному номеру" id="searchValue" class="form-control mb-3" style="box-shadow: 0em 0 .5em #ADADAD;" />
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
            </div>
        </div>
    </div>
</div>


<div class="modal fade" id="dataCert" tabindex="-1" aria-labelledby="dataCertLabel" aria-hidden="true" data-show='true'>
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Данные сертификата</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">                    
                <div class="card text-dark bg-light mb-3 ">

                    <div class="card-body white-fon">
                     <input type="hidden" id="CERT" value=''>
                     <div class="col-md-12">
                        <b><h6 class="mb-2" id="FULL_NAME_CN"></h6></b>
                    </div>
                    <div class="col-md-12">
                        <span>Действителен с: <span id="DATE_VALID_FROM_CERT"></span></span>
                    </div>
                    <div class="col-md-12">
                        <span>Действителен по: <span id="DATE_VALID_TO_CERT"></span></span>
                    </div>
                    <div class="col-md-12">
                        <span>Кем выдан: <span id="ISSUER_CERT"></span>
                    </div>
                    <div class="col-md-12">
                        <span>Кому выдан: <span id="FULL_NAME_SN"></span>
                    </div>
                    <div class="col-md-12">
                        <span>Серийный номер: <span id="SERIAL_NUMBER_CERT"></span></span>
                    </div>
                    <div class="col-md-12">
                        <span>Отпечаток сертификата: <span id="THUMBPRINT_CERT"></span></span>
                    </div>
                </div>

            </div>

        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-green d-none" onclick="dataCert()" id="addCert">Зарегистрировать</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
        </div>
    </div>
</div>
</div>

<div class="modal fade" id="responseErrorModal" tabindex="-1" data-bs-backdrop="static" aria-labelledby="responseErrorModalLabel" aria-hidden="true" data-show='true' data-bs-target="#staticBackdrop">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Результат</h5>
      </div>
      <div class="modal-body">

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-green" data-bs-dismiss="modal">Подтвердить</button>
      </div>

    </div>
  </div>
</div>

<script>
    $('#searchValue').on('keyup', function(event) {
      let value = $('#searchValue').val().toLowerCase();
      $('.card .filter_cert').each(function() {
        let card = $(this).closest('.card');
        let text = $(this).text().toLowerCase();
        text.includes(value)? card.show() : card.hide();
    });
  });   
</script>
<script>
    var vueAppEmployerParams = {
        dynamicParams: {
            crypto_plugin_path: '<?= SITE_TEMPLATE_PATH?>/js/crypt/',
            nodeVue : '<?= $arParams['NODE']?>',
            companyId : '<?= $arParams['COMPANY_ID']?>',
            userId : '<?= $arParams['USER_ID']?>',
            userRole : '<?= $arParams['USER_ROLE']?>'
        }
    }
</script>
<?
//print_r(SITE_TEMPLATE_PATH/js/crypt/);
?>