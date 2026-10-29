sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    'sap/ui/Device',
    'sap/ui/model/Sorter',
    'sap/m/MessageToast',
    'sap/ui/core/Fragment',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    "sap/ui/core/BusyIndicator"
],
    function (Controller, JSONModel, Filter, FilterOperator, MessageBox, Device, Sorter, MessageToast, Fragment, exportLibrary, Spreadsheet, BusyIndicator) {
        var EdmType = exportLibrary.EdmType;

        return Controller.extend("com.claro.proveedores.reportsystemlog.controller.View1", {

            onInit: function () {
                this._mViewSettingsDialogs = {};
                this.getOwnerComponent().getRouter().getRoute("view").attachPatternMatched(this._onObjectMatched, this);
                // sap.ui.getCore().getConfiguration().setLanguage("es");
            },

            _onObjectMatched: function () {
                this.i18n = this.getView().getModel("i18n").getResourceBundle();
                this.jsonDataUser = {
                    userName: "",
                    userCode: "",
                    userMail: ""
                };
                if (parent.sap.ushell !== undefined) {
                    var dataUser = parent.sap.ushell.Container.getUser();
                    var code = dataUser.getEmail() === undefined ? dataUser.getId() : dataUser.getEmail();
                    code = code.split("@")[0].toUpperCase();

                    this.jsonDataUser = {
                        userName: dataUser.getFullName(),
                        userCode: code,
                        userMail: dataUser.getEmail() === undefined ? "" : dataUser.getEmail()
                    };
                }

                var oComponent = this.getOwnerComponent();
                this._router = oComponent.getRouter();

                var modelSettings = new JSONModel({
                    titluloTransaccion: this.i18n.getText("resultados", ["0"]),
                    enabledButtonTable: false
                });

                var arrPicker = [{
                    id: "oDateRangeSelectionInitialId",
                    type: "dateMax"
                }];

                this.functionDisablePicker(arrPicker);
                let oDateRangeSelectionInitial = this.getView().byId("oDateRangeSelectionInitialId");
                let f1 = new Date();
                f1.setHours(0);
                f1.setMinutes(0);
                f1.setSeconds(0);
                let f2 = new Date();
                f2.setHours(23);
                f2.setMinutes(59);
                f2.setSeconds(59);
                oDateRangeSelectionInitial.setDateValue(f1);
                oDateRangeSelectionInitial.setSecondDateValue(f2);
                this.getView().setModel(modelSettings, "oModelSettings");
                this.setCookie().then(function () {
                    this.onSetView();
                }.bind(this));
            },

            setCookie: function () {
                return new Promise(function (resolve) {
                    let href = window.location.href.slice(8);
                    let amb = href.split(".")[0];
                    if (amb.includes("port80")) {
                        amb = "abastible-dev";
                    }
                    let mail = this.jsonDataUser.userMail;
                    let a = "0";
                    let btoaMail = window.btoa(mail).replaceAll("=", "");
                    let btoaAppId = window.btoa(a).replaceAll("=", "");
                    document.cookie = "mail_request." + amb + ".ppc" + "=" + btoaMail;
                    document.cookie = "app_request." + amb + ".ppc" + "=" + btoaAppId;
                    resolve();
                }.bind(this));

            },

            onSetView: function () {

                this.busyGlobal(true);
                this._instance();
                let oDateRangeSelectionInitial = this.getView().byId("oDateRangeSelectionInitialId");
                let f1 = this.getDateTime(oDateRangeSelectionInitial.getDateValue());
                let f2 = this.getDateTime(oDateRangeSelectionInitial.getSecondDateValue());

                var settings = {
                    "url": this.geturl,
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "data": JSON.stringify({
                        "input": {
                            "CREATION_USER_GE": f1,
                            "CREATION_USER_LE": f2
                        }
                    }),
                };
                var oModel = new JSONModel({
                    TITULO_TABLA: this.i18n.getText("resultados", ["0"]),
                    DATA: []
                });

                this.getView().setModel(oModel, "oModel");

                $.ajax(settings).done(function (response) {

                    var dataResponse = response;
                    dataResponse.forEach(function (element) {
                        element.OBJ_DATE_STRING = element.CREATION_DATE == null ? "" : this.formattDateTime(new Date(element.CREATION_DATE));
                    }.bind(this));
                    oModel.setProperty("/DATA", dataResponse);
                    oModel.setSizeLimit(dataResponse.length);
                    oModel.setProperty("/TITULO_TABLA", this.i18n.getText("resultados", [dataResponse.length.toString()]));
                    oModel.refresh();
                    this.busyGlobal(false);
                }.bind(this)).fail(function (jqXHR, textStatus, errorThrown) {

                    this.busyGlobal(false);
                }.bind(this));
            },

            handleSortButtonPressed: function () {
                this.getViewSettingsDialog("com.claro.proveedores.reportsystemlog.view.fragments.dialogoSort")
                    .then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
            },

            handleFilterButtonPressed: function () {
                this.getViewSettingsDialog("com.claro.proveedores.reportsystemlog.view.fragments.dialogoFilter")
                    .then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();

                        var data = this.getView().byId("oTable").getModel("oModel").getData().DATA;

                        var model0 = new JSONModel(),
                            data0 = [],
                            model1 = new JSONModel(),
                            data1 = [],
                            model2 = new JSONModel(),
                            data2 = [],
                            model3 = new JSONModel(),
                            data3 = [],
                            model4 = new JSONModel(),
                            data4 = [],
                            model5 = new JSONModel(),
                            data5 = [],
                            model6 = new JSONModel(),
                            data6 = []


                        if (data.length > 0) {
                            for (var i in data) {
                                data1.push({
                                    key: data[i].DESCRIPTION
                                });
                                data2.push({
                                    key: data[i].LOCATION,
                                    text: data[i].LOCATION
                                });
                                data3.push({
                                    key: data[i].ACTION,
                                    text: data[i].ACTION
                                });
                                data4.push({
                                    key: data[i].CREATION_USER,
                                    text: data[i].CREATION_USER
                                });
                                data5.push({
                                    key: data[i].OBJ_DATE_STRING,
                                    text: data[i].OBJ_DATE_STRING
                                });
                                data6.push({
                                    key: data[i].APP_DESCRIPTION,
                                    text: data[i].APP_DESCRIPTION
                                });

                            }
                            model0.setData([...new Map(data0.map(item => [item['key'], item])).values()]);
                            model1.setData([...new Map(data1.map(item => [item['key'], item])).values()]);
                            model2.setData([...new Map(data2.map(item => [item['key'], item])).values()]);
                            model3.setData([...new Map(data3.map(item => [item['key'], item])).values()]);
                            model4.setData([...new Map(data4.map(item => [item['key'], item])).values()]);
                            model5.setData([...new Map(data5.map(item => [item['key'], item])).values()]);
                            model6.setData([...new Map(data6.map(item => [item['key'], item])).values()]);

                        }
                        oViewSettingsDialog.setModel(model0, "oModelFilter0");
                        oViewSettingsDialog.setModel(model1, "oModelFilter1");
                        oViewSettingsDialog.setModel(model2, "oModelFilter2");
                        oViewSettingsDialog.setModel(model3, "oModelFilter3");
                        oViewSettingsDialog.setModel(model4, "oModelFilter4");
                        oViewSettingsDialog.setModel(model5, "oModelFilter5");
                        oViewSettingsDialog.setModel(model6, "oModelFilter6");

                    }.bind(this));
            },

            getViewSettingsDialog: function (sDialogFragmentName) {

                var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];
                if (!pDialog) {
                    pDialog = Fragment.load({
                        id: this.getView().getId(),
                        name: sDialogFragmentName,
                        controller: this
                    }).then(function (oDialog) {
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }

                        this.getView().addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                    this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
                }
                return pDialog;
            },

            handleSortDialogConfirm: function (oEvent) {

                var oTable = this.getView().byId("oTable"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    sPath,
                    sText,
                    bDescending,
                    aSorters = [];

                if (mParams.sortItem !== undefined) {
                    sPath = mParams.sortItem.getKey();
                    sText = mParams.sortItem.getText();
                    bDescending = mParams.sortDescending;
                    aSorters.push(new Sorter(sPath, bDescending));

                    oBinding.sort(aSorters);
                } else {
                    oBinding.sort([new Sorter("STATUSID", mParams.sortDescending)]);
                }

                var baseIcon = "sap-icon://slim-arrow-";
                oTable.getColumns().forEach(function (element) {
                    var items = element.getHeader().getItems();
                    var label = items[0];
                    if (items[1] !== undefined) {
                        var icon = items[1];
                    }
                    var iconText = "";
                    if (sText === label.getText()) {
                        var i = "up";
                        if (bDescending) {
                            i = "down";
                        }
                        iconText = baseIcon + i;
                    }
                    if (icon) {
                        icon.setSrc(iconText);
                    }
                }.bind(this));

            },

            handleFilterDialogConfirm: function (oEvent) {

                var oTable = this.getView().byId("oTable"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    aFilters = [],
                    arrayText = [];

                if (mParams.filterItems !== undefined) {
                    mParams.filterItems.forEach(function (oItem) {
                        var aText = oItem.getParent().getText(),
                            sPath = oItem.getParent().getKey(),
                            sOperator = "EQ",
                            sValue1 = oItem.getKey(),
                            oFilter = new Filter(sPath, sOperator, sValue1);
                        aFilters.push(oFilter);
                        arrayText.push(aText);
                    });

                    // apply filter settings
                    oBinding.filter(aFilters);
                }

                var baseIcon = "sap-icon://filter";

                oTable.getColumns().forEach(function (element) {

                    var items = element.getHeader().getItems();
                    var label = items[0];
                    if (items[2] !== undefined) {
                        var icon = items[2];
                    }
                    var iconText = "";
                    var filt = arrayText.filter(function (f) {
                        return f === label.getText();
                    }.bind(this));

                    if (filt.length > 0) {
                        iconText = baseIcon;
                    }

                    if (icon) {
                        icon.setSrc(iconText);
                    }


                }.bind(this));

            },

            onSearchTable: function (oEvent) {

                // add filter for search
                var aFilters = [];
                var filterFinal = [];
                var sQuery = oEvent.getSource().getValue();

                if (sQuery && sQuery.length > 0) {
                    var filter1 = new Filter({ path: "DESCRIPTION", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false });
                    aFilters.push(filter1);
                }
                if (aFilters.length > 0) {
                    filterFinal = new Filter({
                        filters: aFilters,
                        and: false
                    });
                }
                var oList = this.getView().byId("oTable");
                var oBinding = oList.getBinding("items");
                oBinding.filter(filterFinal, "Application");
            },

            _instance: function () {

                if (this.getView().getModel("oModel") !== undefined) {
                    this.oModel = this.getView().getModel("oModel");
                };
                if (this.getView().getModel("oModelSettings") !== undefined) {
                    this.oModelSettings = this.getView().getModel("oModelSettings");
                };
                this.i18n = this.getView().getModel("i18n").getResourceBundle();
                this.geturl = this.getOwnerComponent().getManifestObject().resolveUri('../PORTAL_PROVEEDORES_REST/gReportSystemLog');
            },

            busyGlobal: function (cond) {
                if (cond) {
                    BusyIndicator.show(0);
                } else {
                    jQuery.sap.delayedCall(1500, this, function () {
                        BusyIndicator.hide();
                    }.bind(this));
                }
            },

            formattDateTime: function (fecha) {
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    style: 'medium',
                    UTC: true,
                    pattern: 'dd/MM/YYYY HH:mm'
                });
                var dateFormatted = dateFormat.format(fecha);
                return dateFormatted;
            },
            getDateTime: function (fecha) {
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    style: 'medium',
                    UTC: true,
                    pattern: 'yyyy-MM-dd'
                });
                var dateFormatted = dateFormat.format(fecha);
                var salida = dateFormatted + "T" + this.addZero(fecha.getHours()) + ":" + this.addZero(fecha.getMinutes());
                return salida;
            },

            addZero: function (sValue) {
                if (sValue < 10) {
                    sValue = "0" + sValue;
                }
                return sValue;
            },

            onDescargaExcel: function () {
                var aCols, oBinding, oSettings, oSheet, oTable;

                oTable = this.getView().byId('oTable');
                oBinding = oTable.getBinding('items').oList;
                aCols = this.createColumnConfig();
                oSettings = {
                    workbook: { columns: aCols },
                    fileName: 'DataReporteLog.xlsx',
                    dataSource: oBinding
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().then(function () {
                    MessageToast.show(this.i18n.getText("ok2"));
                }).finally(function () {
                    oSheet.destroy();
                });
            },

            createColumnConfig: function () {


                var description = this.i18n.getText("description"),
                    origen = this.i18n.getText("origen"),
                    accion = this.i18n.getText("accion"),
                    usuario = this.i18n.getText("usuario"),
                    fecha = this.i18n.getText("fecha"),
                    app = this.i18n.getText("app")

                return [
                    {
                        label: description,
                        property: 'DESCRIPTION',
                        type: EdmType.String
                    },
                    {
                        label: origen,
                        property: 'LOCATION',
                        type: EdmType.String
                    },
                    {
                        label: accion,
                        property: 'ACTION',
                        type: EdmType.String
                    },
                    {
                        label: usuario,
                        property: 'CREATION_USER',
                        type: EdmType.String
                    },
                    {
                        label: fecha,
                        property: 'OBJ_DATE_STRING',
                        type: EdmType.String
                    },
                    {
                        label: app,
                        property: 'APP_DESCRIPTION',
                        type: EdmType.String
                    }
                ];
            },

            onDialogModify: function (oEvent) {

                this._instance();
                var obj = oEvent.getSource().getBindingContext("oModel").getObject();
                this.selected = obj;
                var jsonEdit = {};

                for (var key in obj) {
                    jsonEdit[key] = obj[key];
                }

                var oModelView = new JSONModel(jsonEdit);
                this.getView().setModel(oModelView, "oModelView");

                this._dialogViewDetail = sap.ui.xmlfragment(
                    "com.claro.proveedores.reportsystemlog.view.fragments.dialogoViewDetail", this);

                this._dialogViewDetail.attachAfterClose(function () {
                    this._dialogViewDetail.destroy();
                }.bind(this));

                this.getView().addDependent(this._dialogViewDetail);
                this._dialogViewDetail.open();
                this._dialogViewDetail.setBusy(true);

                this._dialogViewDetail.setEscapeHandler(function () {
                    this._dialogViewDetail.open();
                }.bind(this));

                this._dialogViewDetail.setBusy(false);

            },

            dialogViewDetailClose: function () {
                this._dialogViewDetail.destroy();
            },

            functionDisablePicker: function (arr) {

                for (var i = 0; i < arr.length; i++) {
                    var oDatePicker = this.getView().byId(arr[i].id) || sap.ui.getCore().byId(arr[i].id);

                    if (arr[i].type === "dateMin") {
                        oDatePicker.setMinDate(new Date());
                    } else if (arr[i].type === "dateMax") {
                        oDatePicker.setMaxDate(new Date());
                    }
                    oDatePicker.setValue();

                    oDatePicker.addEventDelegate({
                        onAfterRendering: function () {
                            var oDateInner = this.$().find('.sapMInputBaseInner');
                            var oID = oDateInner[0].id;
                            $('#' + oID).attr("disabled", "disabled");
                        }
                    }, oDatePicker);
                }
            },

        });

    });

