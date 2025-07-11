BX.ready(() => {
    const node = BX('employer')
    const application = BX.Vue3.createApp({
        data() {
            return {
                nodeVue : window['vueAppEmployerParams'].dynamicParams.nodeVue,
                myModal: null,
                componentName: 'edidata:certificate',
                crypto_plugin_path : window['vueAppEmployerParams'].dynamicParams.crypto_plugin_path,
                companyId : window['vueAppEmployerParams'].dynamicParams.companyId,
                userId : window['vueAppEmployerParams'].dynamicParams.userId,
                userRole : window['vueAppEmployerParams'].dynamicParams.userRole,
                cert_params : {},
                oCerts : {},
                content: '',
                content_hide: false,
                isCert : false,
                keyArr : [],
                modal: document.getElementById('autorizationUserModal'),
                certCount : 0,
                message : '',
                params : {},
                isError : false,
            };
        },
        mounted(){

        },
        created(){
            window.uploadCert = this.uploadCert;
            window.showCert = this.showCert;
            window.showActiveCert = this.showActiveCert;
            window.addCertTable = this.addCertTable;
            window.saveCert = this.saveCert;
            window.activeCert = this.activeCert;
            window.deleteCert = this.deleteCert;
            window.dataListCert = this.dataListCert;
            window.goDoSomething = this.goDoSomething;
            window.existsFile = this.existsFile;
            window.dataCert = this.dataCert;
            window.addTemplateCert = this.addTemplateCert;
        },
        methods: {
            showToast(text) {
                if (!!eplTemplate)
                    eplTemplate.getInstance().showToast(text);
            },
            modalBs1(modal){
                this.myModalFlight = new bootstrap.Modal(modal, {
                  keyboard: false
              });
            },
            getCryptoPlugin() {
                if (typeof this.cryptoPlugin === 'undefined') {
                    this.cryptoPlugin = new CryptoPluginWrapper({
                        cryptoPluginPath: this.crypto_plugin_path
                    });
                }
                return this.cryptoPlugin;
            }, 
            getCertFindParams() {
                return this.cert_params;
            },
            
            dataCert(){
                this.params = {
                    'USER_ID': Number(document.getElementById('dataCert').dataset.id),
                    'MEMBER_ID': Number(this.companyId),
                    'TYPE': 'Квалифицированный',
                    'FULL_NAME': document.getElementById('FULL_NAME_CN').innerHTML,
                    'DATE_START': document.getElementById('DATE_VALID_FROM_CERT').innerHTML,
                    'DATE_END': document.getElementById('DATE_VALID_TO_CERT').innerHTML,
                    'SERIAL_NUMBER': document.getElementById('SERIAL_NUMBER_CERT').innerHTML,
                    'THUMBPRINT': document.getElementById('THUMBPRINT_CERT').innerHTML,
                    'ISSUER': document.getElementById('ISSUER_CERT').innerHTML,
                    'OWNER': document.getElementById('FULL_NAME_SN').innerHTML,
                    'ACTIVE': 'Y',
                    'CERT': document.getElementById('CERT').value,
                }
                this.addCertTable(this.params);
            },
            goDoSomething(d){
                _this = this;
                _this.getCryptoPlugin().getCertContent({thumbprint:d.getAttribute("data-id")}).then(function (response) {
                    var certContent = response;
                    _this.getCryptoPlugin().getCertInfo(certContent).then(function (response) {
                        if (new Date(response.date_valid_to) < new Date()) {
                            $('#loadList').modal('hide');
                            $('#responseErrorModal').modal('show');
                            document.querySelector('#responseErrorModal .modal-body').innerHTML = '<h6>Срок действия сертификата истек, для продолжения работы выберите актуальный сертификат</h6>';
                        } else if(document.getElementById('loadList').getAttribute('data-name') !== response.subjectname['SN'] + ' ' + response.subjectname['G'] && _this.userRole !== 'EPL_ADMIN'){
                            $('#loadList').modal('hide');
                            $('#responseErrorModal').modal('show');
                            document.querySelector('#responseErrorModal .modal-body').innerHTML = '<h6>ФИО сотрудника отличается от ФИО владельца сертификата, для продолжения работы выберите другой сертификат</h6>';
                        } else{
                            _this.params = {
                                'USER_ID': Number(document.getElementById('loadList').dataset.id),
                                'MEMBER_ID': Number(_this.companyId),
                                'TYPE': 'Квалифицированный',
                                'FULL_NAME': response.subjectname['SN'] + ' ' + response.subjectname['G'],
                                'DATE_START': new Date(response.date_valid_from).toLocaleString(),
                                'DATE_END': new Date(response.date_valid_to).toLocaleString(),
                                'SERIAL_NUMBER': response.serialnumber,
                                'THUMBPRINT': response.thumbprint,
                                'ISSUER': response.issuer['O'].replace(/\"/g, ""),
                                'OWNER': response.subjectname['CN'],
                                'ACTIVE': 'Y',
                                'CERT': certContent,
                            }
                            _this.addCertTable(_this.params);
                        }
                    })

                })
                
            },
            showCert(event) {
                _this = this;
                document.getElementById('loadList').setAttribute('data-id' , event.target.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.id);
                document.getElementById('loadList').setAttribute('data-name' , event.target.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.name);
                if (_this.isCert === false) {
                    _this.getCryptoPlugin().getCertList().then(function (response) {
                        _this.isCert = true;
                        for (var i in response) {
                            _this.oCerts[response[i].thumbprint] = {
                                'dateValidTo':      response[i].date_valid_to,
                                'dateValidFrom':    response[i].date_valid_from,
                                'SerialNumber':     response[i].serialnumber,
                                'thumbprint':       response[i].thumbprint,
                                'SubjectName_SN':   response[i].subjectname["SN"],
                                'SubjectName_CN':   response[i].subjectname["CN"],
                                'SubjectName_G':    response[i].subjectname["G"],
                                'SubjectName_O':    response[i].subjectname["O"],
                                'IssuerName' :      response[i].issuer["O"].replace(/\"/g, ""),
                            };
                            _this.certCount = _this.certCount + 1;
                        }
                        if (_this.certCount > 0) {
                            for(var thumbprint in _this.oCerts) {
                                el = document.createElement("div");
                                el.className = "card text-dark bg-light mb-3"
                                el.innerHTML ='<a class="cert-href" data-id="'+_this.oCerts[thumbprint].thumbprint+'" href="javascript: void 0" onclick="goDoSomething(this);">'+
                                '<div class="card-body white-fon">'+
                                '<div class="filter_cert">'+
                                '<div class="col-md-12">'+
                                '<h6>'+_this.oCerts[thumbprint].SubjectName_CN+'</h6>'+
                                '</div>'+
                                '<div class="col-md-12">'+
                                '<span>Серийный номер: '+_this.oCerts[thumbprint].SerialNumber+'</span>'+
                                '</div>'+
                                '</div>'+
                                '<div class="col-md-12">'+
                                '<span>Действителен по: '+new Date(_this.oCerts[thumbprint].dateValidTo).toLocaleString()+'</span>'+
                                '</div>'+
                                '</div>'+
                                '</a>'+
                                '<input name="thumbprintData" type ="hidden" value="'+_this.oCerts[thumbprint].thumbprint+'"></input>';
                                document.querySelector('#loadList .modal-body').appendChild(el);
                            }
                        } 
                    }, function (error) {
                        if (_this.isError === false) {
                            _this.isError = true;
                            document.querySelector('#loadList .modal-body').querySelector('input').style.display = 'none';
                            el = document.createElement("div");
                            el.className = "card text-dark bg-light mb-3 col-md-12 mt-10";
                            el.innerHTML =
                            '<div class="card-body white-fon">'+
                            '<div class="col-md-12 text-center mt-3">'+
                            '<h6>Настройка компьютера</h6>'+
                            '</div>'+
                            '<div class="col-md-12 text-center mt-3">'+
                            '<span>Для работы необходимо установить следующие программы</span>'+
                            '</div>'+
                            '<div class="col-md-12 mt-3  mb-3">'+
                            '<div class="row">'+
                            '<div class="col-md-6 text-center">'+
                            '<h6>&#171КриптоПро CSP&#187</h6>'+
                            '</div>'+
                            '<div class="col-md-6 text-center">'+
                            '<h6>&#171Браузер Плагин&#187</h6>'+
                            '</div>'+
                            '<div class="col-md-6 mt-2 text-center">'+
                            '<a href="/upload/files/CryptoPro.exe" target="_blank" class="btn btn-white mb-2 mb-md-0" download>Установить</a>'+
                            '</div>'+
                            '<div class="col-md-6 mt-2 text-center">'+
                            '<a href="https://www.cryptopro.ru/products/cades/plugin/get_2_0" target="_blank" class="btn btn-white mb-2 mb-md-0" download>Установить</a>'+
                            '</div>'+
                            '</div>'+
                            '</div>'+
                            '</div>';
                            document.querySelector('#loadList .modal-body').insertBefore(el, document.querySelector('#loadList .modal-body').firstElementChild);
                        } 
                    });
                }
            },
            uploadCert(event){
                document.getElementById('upload').value = '';
                event.preventDefault();
                $("#upload:hidden").trigger('click');
                document.getElementById('upload').setAttribute('data-id' , event.target.parentNode.parentNode.parentNode.parentNode.dataset.id);
                document.getElementById('upload').setAttribute('data-name' , event.target.parentNode.parentNode.parentNode.parentNode.dataset.name);
            },
            isBase64(value){
                value = value.replace("-----BEGIN CERTIFICATE-----", '');
                value = value.replace("-----END CERTIFICATE-----", '');
                value = value.replace(/\r?\n|\r/g, '');
                value = value.trim();
                
                reg1 = /^([A-Za-z0-9+\/]{4})*([A-Za-z0-9+\/]{4}|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{2}==)$/;
                return reg1.test(value);
            },
            existsFile(event){
                if(event.target.value ){
                    const reader = new FileReader();
                    reader.readAsBinaryString(event.target.files[0]);

                    if (event.target.files[0].name.substr(event.target.files[0].name.indexOf('.')) !== '.cer') {
                        alert("Выберите файл сертификата");
                        reader.abort();
                    } else{
                        _this = this;
                        document.getElementById('addCert').classList.remove('d-none');
                        document.getElementById('dataCert').setAttribute('data-id', event.target.dataset.id);
                        document.getElementById('dataCert').setAttribute('data-name', event.target.dataset.name);
                        
                        reader.onload = function(event) {
                            sert = event.target.result;
                            
                            if (_this.isBase64(sert) === false) {
                                sert = btoa(sert);
                            }
                            
                            document.getElementById('CERT').value = String(sert);
                            
                            _this.getCryptoPlugin().getCertInfo(sert).then(function (response) {
                                if (new Date(response.date_valid_to) < new Date()) {
                                    $('#dataCert').modal('hide');
                                    $('#responseErrorModal').modal('show');
                                    document.querySelector('#responseErrorModal .modal-body').innerHTML = '<h6>Срок действия сертификата истек, для продолжения работы выберите актуальный сертификат</h6>';
                                } else if(document.getElementById('dataCert').getAttribute('data-name') !== response.subjectname['SN'] + ' ' + response.subjectname['G'] && _this.userRole !== 'EPL_ADMIN'){
                                    $('#dataCert').modal('hide');
                                    $('#responseErrorModal').modal('show');
                                    document.querySelector('#responseErrorModal .modal-body').innerHTML = '<h6>ФИО сотрудника отличается от ФИО владельца сертификата, для продолжения работы выберите другой сертификат</h6>';
                                } else{
                                    $('#update_profile').modal('hide');
                                    $('#dataCert').modal('show');
                                    document.getElementById('FULL_NAME_CN').innerHTML = response.subjectname['CN'];
                                    document.getElementById('FULL_NAME_SN').innerHTML = response.subjectname['SN'] + ' ' + response.subjectname['G'];
                                    document.getElementById('DATE_VALID_FROM_CERT').innerHTML = new Date(response.date_valid_from).toLocaleString();
                                    document.getElementById('DATE_VALID_TO_CERT').innerHTML = new Date(response.date_valid_to).toLocaleString();
                                    document.getElementById('SERIAL_NUMBER_CERT').innerHTML = response.serialnumber;
                                    document.getElementById('THUMBPRINT_CERT').innerHTML = response.thumbprint;
                                    document.getElementById('ISSUER_CERT').innerHTML = response.issuer['O'].replace(/\"/g, "");
                                }
                                
                                

                            });                

                        }
                    }
                }
            },
            inputFind(){
                value = $('#searchValue').val().toLowerCase();
            },

            addCert(){
                this.modalBs1(document.getElementById('dataCert'));
                this.myModalFlight.hide();

            },

            addCertTable(params){
                _this = this;
                BX.ajax.runComponentAction(this.componentName, "addCertificate", {
                    data: {
                        params: this.params
                    }
                }).then(function (response) {
                    //location.reload();
                    cert = document.querySelectorAll('[name="certInfo"]');
                    cert.forEach((element) => {
                        if (Number(element.getAttribute("data-id")) === Number(response.data.USER_ID)) {
                            element.querySelector('[data-id = "'+response.data.USER_ID+'"]').innerHTML = _this.addTemplateCert(response.data);
                        }
                    })
                    $('#dataCert').modal('hide');
                    $('#loadList').modal('hide');
                    _this.showToast('Сертификат установлен');
                    //document.querySelector('[name="certInfo"]').querySelector('[data-id = "'+response.data.USER_ID+'"]').innerHTML = _this.addTemplateCert(response.data);
                }, function (response) {
                    alert(response.errors[0].message);
                    console.log(response);
                });
            },
            showActiveCert(id){
                BX.ajax.runComponentAction(this.componentName, "getCertificate", {
                    data: {
                        'user_id' : id,
                    }
                }).then(function (response) {
                    document.getElementById('FULL_NAME_CN').innerHTML = response.data.OWNER;
                    document.getElementById('FULL_NAME_SN').innerHTML = response.data.FULL_NAME;
                    document.getElementById('DATE_VALID_FROM_CERT').innerHTML = new Date(response.data.DATE_START).toLocaleString();
                    document.getElementById('DATE_VALID_TO_CERT').innerHTML = new Date(response.data.DATE_END).toLocaleString();
                    document.getElementById('SERIAL_NUMBER_CERT').innerHTML = response.data.SERIAL_NUMBER;
                    document.getElementById('THUMBPRINT_CERT').innerHTML = response.data.THUMBPRINT;
                    document.getElementById('ISSUER_CERT').innerHTML = response.data.ISSUER;
                    document.getElementById('addCert').classList.add('d-none');
                    $('#dataCert').modal('show');
                }, function (response) {
                    alert(response.errors[0].message);
                    console.log(response);
                });

            },
            downloadCert(filename, content){
                content = content.trim();
                content = content.replace(/\s+/g, '');
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
                element.setAttribute('download', filename + '.cer');
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            },
            saveCert(id){
                _this = this;
                BX.ajax.runComponentAction(this.componentName, "saveCertificate", {
                    data: {
                        'user_id' : id,
                    }
                }).then(function (response) {
                    _this.downloadCert(response.data.OWNER, response.data.CERT);
                }, function (response) {
                    alert(response.errors[0].message);
                    console.log(response);
                });

            },
            
            updateActiveCert(id, status){
                if (status === 'Y'){
                    cert = document.querySelectorAll('[name="certInfo"]');
                    cert.forEach((element) => {
                        if (Number(element.getAttribute("data-id")) === Number(id)) {
                            element.querySelector('[data-id = "'+id+'"]').querySelector('[data-name = "ACTIVATION"]').querySelector('b').innerHTML = 'Включить';
                            element.querySelector('[data-id = "'+id+'"]').querySelector('[data-name = "DATA_CERT_INFO"]').classList.add('no-active');
                            _this.showToast('Сертификат деактивирован');
                        }
                    })
                } else {
                    cert = document.querySelectorAll('[name="certInfo"]');
                    cert.forEach((element) => {
                        if (Number(element.getAttribute("data-id")) === Number(id)) {
                            element.querySelector('[data-id = "'+id+'"]').querySelector('[data-name = "ACTIVATION"]').querySelector('b').innerHTML = 'Отключить';
                            element.querySelector('[data-id = "'+id+'"]').querySelector('[data-name = "DATA_CERT_INFO"]').classList.remove('no-active');
                            _this.showToast('Сертификат активирован');
                        }
                    })
                }
            },
            addTemplateCert(cert){
                if (cert.ACTIVE === 'Y') {
                    cls_no_active = '';
                    activeCert = 'Отключить';
                } else {
                    cls_no_active = 'no-active';
                    activeCert = 'Включить';
                }
                template = '<div class="col-md-12" data-id="'+cert.USER_ID+'">'+
                '<div class="row"><div data-name = "DATA_CERT_INFO" class="col-xl-6 '+cls_no_active+'">'+
               ' <b>'+cert.OWNER+'</b>'+
                '<br/>'+cert.THUMBPRINT+'</div>'+
                '<div class="col-xl-6">'+
                '<div class="row">'+
                '<div class="col-md">'+
                '<a href="javascript: void 0" onclick="showActiveCert('+cert.USER_ID+')"><b>Посмотреть</b></a>'+
                '</div>'+
                '<div class="col-md">'+
                '<a href="javascript: void 0" onclick="saveCert('+cert.USER_ID+')"><b>Скачать</b></a>'+
                '</div>'+
                '<div class="col-md">'+
                '<a href="javascript: void 0" data-name="ACTIVATION" onclick="vm.activeCert('+cert.USER_ID+')"><b>'+activeCert+'</b></a>'+
                '</div>'+
                '<div class="col-md">'+
                '<a href="javascript: void 0" onclick="deleteCert('+cert.USER_ID+')"><b>Удалить</b></a>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>';
                return template;
            },
            deleteTemplateCert(id){
                template = '<div class="col-md-12" data-id="'+id+'">'+
                '<div class="row">'+
                '<div class="col-md-6">'+
                '<a onclick="uploadCert(event)" href="javascript: void 0" id="upload_link"><b>Загрузить (в формате .cer)</b></a>'+
                '</div>'+
                '<div class="col-md-6">'+
               ' <a href="javascript: void 0" data-bs-target="#loadList" data-bs-toggle="modal" data-bs-dismiss="modal" onclick="showCert(event)"><b>Загрузить из списка установленных</b></a>'+
                '</div>'+
               ' </div>'+
                '</div>';
                return template;
            },
            deleteCert(id){
                _this = this;
                BX.ajax.runComponentAction(this.componentName, "deleteCertificate", {
                    data: {
                        'user_id' : id,
                    }
                }).then(function (response) {
                    cert = document.querySelectorAll('[name="certInfo"]');
                    cert.forEach((element) => {
                        if (Number(element.getAttribute("data-id")) === Number(id)) {
                            element.querySelector('[data-id = "'+id+'"]').innerHTML = _this.deleteTemplateCert(id);
                        }
                    })
                    _this.showToast('Сертификат удален');
                }, function (response) {
                    alert(response.errors[0].message);
                    console.log(response);
                });

            },
            activeCert(id){
                _this = this;
                BX.ajax.runComponentAction(this.componentName, "activeCertificate", {
                    data: {
                        'user_id' : id,
                    }
                }).then(function (response) {
                    _this.updateActiveCert(id, response.data);
                }, function (response) {
                    alert(response.errors[0].message);
                    console.log(response);
                });

            },

        },
    });

vm = application.mount(node);

})