<?php
use Bitrix\Main\Error;
use Bitrix\Main\ErrorCollection;


if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) {
    die();
}

/**
 * Компонент вывода информации о компании
 */
class CertificateComponent extends CBitrixComponent
{
    /** @var ErrorCollection $errors */
    public ErrorCollection $errors;

     
    /**
     * @return void
     * @throws LoaderException
     */
    public function executeComponent(): void
    {
        global $APPLICATION;
        $this->errors = new ErrorCollection();

        if (!Bitrix\Main\Loader::includeModule('edidata.epl')) {
            $this->errors->setError(new Error('Модуль "ЭПЛ" не установлен'));
        }        

        $this->includeComponentTemplate();
    }

   
}