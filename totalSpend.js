var totalOrders = 0;
var totalSpent = 0;
var totalShippingSpent = 0;
var totalItems = 0;
var pulling = true;
var offset = 0;
var page = 0;
var ids = [];
// add your access_token in shopeeFood
// you can get it by tracking the api call to /social_login when login into account
var access_token = "";

function shopeeFood() {
  var today = new Date().toLocaleDateString("en-CA");
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      ids = JSON.parse(this.responseText)["reply"]["ids"];

      if (ids.length > 0) {
        shopeeFoodGetInfo();
      }
    }
  };

  xhttp.open(
    "POST",
    "https://gappapi.deliverynow.vn/api/order/get_infos_by_user_order_status_ids",
    true
  );
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.setRequestHeader("x-foody-access-token", access_token);
  xhttp.setRequestHeader("x-foody-api-version", "1");
  xhttp.setRequestHeader("x-foody-app-type", "1004");
  xhttp.setRequestHeader("x-foody-client-id", "");
  xhttp.setRequestHeader("x-foody-client-language", "vi");
  xhttp.setRequestHeader("x-foody-client-type", "1");
  xhttp.setRequestHeader("x-foody-client-version", "3.0.0");

  xhttp.send(
    JSON.stringify({
      exclude_status: [],
      from_date: "2019-01-01",
      to_date: today,
      foody_service_ids: [1, 5, 13, 6, 4, 7, 12],
    })
  );
}

function shopeeFoodGetInfo() {
  var xhttp = new XMLHttpRequest();
  let orderShopeeFoods = [];
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      orderShopeeFoods = JSON.parse(this.responseText)["reply"]["orders"];
      totalOrders += orderShopeeFoods.length;

      orderShopeeFoods.forEach((order) => {
        let tpa = order["paid_status"]["amount"]["value"];
        totalSpent += tpa;
        let tpti = order["order_items"]["items"]["total_count"];
        totalItems += tpti;
      });
      printAndReset();
    }
  };

  xhttp.open(
    "POST",
    "https://gappapi.deliverynow.vn/api/order/get_infos_by_user_order_status",
    true
  );
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.setRequestHeader("x-foody-access-token", access_token);
  xhttp.setRequestHeader("x-foody-api-version", "1");
  xhttp.setRequestHeader("x-foody-app-type", "1004");
  xhttp.setRequestHeader("x-foody-client-id", "");
  xhttp.setRequestHeader("x-foody-client-language", "vi");
  xhttp.setRequestHeader("x-foody-client-type", "1");
  xhttp.setRequestHeader("x-foody-client-version", "3.0.0");
  xhttp.send(
    JSON.stringify({
      ids: ids,
    })
  );
}

function lazada() {
  var orders = {};
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      orders = JSON.parse(this.responseText)["module"]["data"];

      for (const [key, value] of Object.entries(orders)) {
        if (key.startsWith("order_")) {
          totalOrders += 1;

          let groupId = orders[key]["fields"]["groupId"];
          let tradeOrderId = orders[key]["fields"]["tradeOrderId"];

          let detailReq = new XMLHttpRequest();
          detailReq.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
              let orderDetail = JSON.parse(this.responseText)["module"]["data"];
              let price =
                orderDetail["totalSummary_" + tradeOrderId]["fields"][
                  "total"
                ] || 0;
              let shipping_fee =
                orderDetail["totalSummary_" + tradeOrderId]["fields"][
                  "fees"
                ].find((fee) => fee.key === "Shipping Fee").value || 0;

              totalSpent += parseInt(price.split(" ")[1].replace(",", ""));
              totalShippingSpent += parseInt(
                shipping_fee.split(" ")[1].replace(",", "")
              );
            }
          };
          detailReq.open(
            "POST",
            "https://my.lazada.vn/customer/api/sync/order-detail",
            false
          );
          detailReq.setRequestHeader(
            "Content-Type",
            "application/json;charset=UTF-8"
          );
          detailReq.send(
            JSON.stringify({
              ultronVersion: "2.0",
              shopGroupKey: groupId,
              tradeOrderId: tradeOrderId,
            })
          );
        } else if (key.startsWith("orderItem_")) {
          totalItems += 1;
        }
      }
      printAndReset();
    }
  };
  xhttp.open("POST", "https://my.lazada.vn/customer/api/sync/order-list", true);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(
    JSON.stringify({
      ultronVersion: "2.0",
    })
  );
}

function tiki() {
  var orders = [];
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      orders = JSON.parse(this.responseText)["data"];
      totalOrders += orders.length;

      pulling = orders.length >= 10;
      orders.forEach((order) => {
        let tpa = order["grand_total"];
        totalSpent += tpa;
        order["items"].forEach((item) => {
          let tpti = item["qty"];
          totalItems += tpti;
        });
      });

      page += 1;
      console.log("Đã lấy được: " + totalOrders + " đơn hàng");
      if (pulling) {
        console.log("Đang kéo thêm...");
        tiki();
      } else {
        printAndReset();
      }
    }
  };

  xhttp.open(
    "GET",
    "https://tiki.vn/api/v2/orders?page=" + page + "&limit=10",
    true
  );
  xhttp.send();
}

function shopee() {
  var orders = [];
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      orders = JSON.parse(this.responseText)["orders"];
      totalOrders += orders.length;
      pulling = orders.length >= 10;
      orders.forEach((order) => {
        let tpa = order["paid_amount"] / 100000;
        totalSpent += tpa;
        let tpsa = order["shipping_fee"] / 100000;
        totalShippingSpent += tpsa;
        order["items"].forEach((item) => {
          let tpti = item["amount"];
          totalItems += tpti;
        });
      });
      offset += 10;
      console.log("Đã lấy được: " + totalOrders + " đơn hàng");
      if (pulling) {
        console.log("Đang kéo thêm...");
        shopee();
      } else {
        printAndReset();
      }
    }
  };
  xhttp.open(
    "GET",
    "https://shopee.vn/api/v1/orders/?order_type=3&offset=" +
      offset +
      "&limit=10",
    true
  );
  xhttp.send();
}

function moneyFormat(number, fixed = 0) {
  if (isNaN(number)) return 0;
  number = number.toFixed(fixed);
  let delimeter = ",";
  number += "";
  let rgx = /(\d+)(\d{3})/;
  while (rgx.test(number)) {
    number = number.replace(rgx, "$1" + delimeter + "$2");
  }
  return number;
}

function printAndReset() {
  console.log(
    "%cTổng đơn hàng đã giao: " + "%c" + moneyFormat(totalOrders),
    "font-size: 30px;",
    "font-size: 30px; color:red"
  );
  console.log(
    "%cTổng sản phẩm đã đặt: " + "%c" + moneyFormat(totalItems),
    "font-size: 30px;",
    "font-size: 30px; color:red"
  );
  console.log(
    "%cTổng chi tiêu: " + "%c" + moneyFormat(totalSpent) + "đ",
    "font-size: 30px;",
    "font-size: 30px; color:red"
  );
  console.log(
    "%cTổng tiền ship: " + "%c" + moneyFormat(totalShippingSpent) + "đ",
    "font-size: 30px;",
    "font-size: 30px; color:red"
  );

  totalOrders = 0;
  totalItems = 0;
  totalSpent = 0;
  totalShippingSpent = 0;
}
