sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/ui/core/format/DateFormat"
], function (Controller, Filter, FilterOperator, MessageToast, DateFormat) {
  "use strict";

  return Controller.extend("sync.ea.qrbatch.controller.Main", {
      onInit: function () {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.getRoute("batchRoute").attachPatternMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {
          var sBatch = oEvent.getParameter("arguments").batchNumber;
          this._loadBatchData(sBatch);
      },

      _loadBatchData: function (sBatch) {
          if (!sBatch) {
              MessageToast.show("배치 번호가 제공되지 않았습니다.");
              return;
          }

          this.onFilter(sBatch);
      },

      onFilter: function (sBatch) {
          var aFilters = [];
          var oList = this.byId("list");
          var oTable = this.byId("responsiveTable");

          // Batch Number 필터 추가
          if (sBatch) {
              aFilters.push(new Filter("Charg", FilterOperator.EQ, sBatch));
          }

          // 필터 적용
          if (oList.getBinding("items")) {
              oList.getBinding("items").filter(aFilters);
              console.log("Filters applied to list:", aFilters);
          } else {
              console.error("List binding not found");
          }

          if (oTable.getBinding("items")) {
              oTable.getBinding("items").filter(aFilters);
              console.log("Filters applied to table:", aFilters);

              // 테이블 데이터가 로드된 후에 총 재고량을 계산
              oTable.getBinding("items").attachDataReceived(this._calculateTotalQty.bind(this));
          } else {
              console.error("Table binding not found");
          }
      },

      _calculateTotalQty: function () {
          var oModel = this.getView().getModel();
          var oTable = this.byId("responsiveTable");
          var aItems = oTable.getItems();
          var total = 0;

          aItems.forEach(function (item) {
              total += parseFloat(item.getBindingContext().getProperty("Remqty"));
          });

          var data = {
              TotalQty: total
          };

          var oJSONModel = new sap.ui.model.json.JSONModel(data);
          this.getView().setModel(oJSONModel, "view");
          console.log("TotalQty calculated:", total);
      },

      // 날짜 차이를 계산하는 유틸리티 함수
      _getDateDifference: function (sDate1) {
          var oDateFormat = DateFormat.getDateInstance({ pattern: "yyyyMMdd" });
          var oDate1 = oDateFormat.parse(sDate1);
          var oDate2 = new Date();

          var iDifferenceInTime = oDate2.getTime() - oDate1.getTime();
          var iDifferenceInDays = iDifferenceInTime / (1000 * 3600 * 24);
          return Math.floor(iDifferenceInDays);
      },

      // 상태 텍스트를 결정하는 유틸리티 함수
      _getStatusState: function (sTsdat) {
          var iDaysDifference = this._getDateDifference(sTsdat);
          if (iDaysDifference <= 180) {
              // 6개월 이내
              return "Success";
          } else if (iDaysDifference <= 730) {
              // 2년 이내
              return "Warning";
          } else {
              // 2년 초과
              return "Error";
          }
      }
  });
});
