<?php
define("NEED_AUTH", false);
define("NOT_CHECK_PERMISSIONS", true);


use Bitrix\Main\Engine\Controller;
use \Bitrix\Main\Loader as Loader;
use \Bitrix\Main\Error as Error;
use Edidata\Certificate\Mapper\CertificateMapper;
use Edidata\Certificate\Repository\CertificateRepository;
use Edidata\Certificate\Service\CertificateService;
use Edidata\Main\Tools;
use Bitrix\Main\Engine\ActionFilter;



if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();

Loader::includeModule("edidata.epl");
Loader::includeModule("edidata.certificate");


class CertificateAjaxController extends Controller
{

	public function addCertificateAction($params)
	{
		$service = new CertificateService();
		if ($service->accessList((int)$params['USER_ID'])) {
			$params['INSERT_DATE_TIME'] = new Bitrix\Main\Type\DateTime();
			$params['DATE_START'] = new Bitrix\Main\Type\DateTime($params['DATE_START']);
			$params['DATE_END'] = new Bitrix\Main\Type\DateTime($params['DATE_END']);
			
			$result = $service->addCertificate(CertificateMapper::arrayDBToDto($params));
			return CertificateMapper::dtoToDBArray($result);
		}
		
	}

	public function getCertificateAction(?int $user_id)
	{
		$service = new CertificateService();
		if ($service->accessList($user_id)) {
			
			$dataCert = $service->getCertificate($user_id);
			if ($dataCert !== null) {
				foreach ($dataCert as $key => $value) {
					return CertificateMapper::dtoToDBArray($value);
				}
			} else{
				return null;
			}
			
		}
		
	}


	public function saveCertificateAction(?int $user_id): array
	{
		$service = new CertificateService();
		if ($service->accessList($user_id)) {
			$dataCert = $service->getCertificate($user_id);
			foreach ($dataCert as $key => $value) {
				$cert = CertificateMapper::dtoToDBArray($value);
			}
			return $cert;
		}
	}

	public function activeCertificateAction(?int $user_id)
	{
		$service = new CertificateService();
		if ($service->accessList($user_id)) {
			$result = $service->updateActiveCert($user_id);
			return $result;
		}
	}

	public function deleteCertificateAction(?int $user_id)
	{
		$service = new CertificateService();
		if ($service->accessList($user_id)) {
			$result = $service->deleteCertificate($user_id);
			return $result;
		}
	}

	
}