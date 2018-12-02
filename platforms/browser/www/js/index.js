/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var appCordova = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        appCordova.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
      console.log('Received Event: ' + id);
    }
};

var app = new Framework7({
  // App root element
  root: '#app',
  // App Name
  name: 'My App',
  // App id
  id: 'com.myapp.test',
  // Enable swipe panel
  panel: {
    swipe: 'left',
  },
  // Add default routes
  routes: [
    {
      path: '/',
      url: 'index.html',
    },
    {
      path: '/about/',
      url: 'about.html',
    },
    {
      path: '/favorites/',
      componentUrl: 'favorites.html',
    },
    {
      path: '/product/:id',
      name: "product",
      componentUrl: 'product.html',
    },
  ],
  // ... other parameters
});

var mainView = app.views.create('.view-main');

var $$ = Dom7;

var codebar = function(){
  cordova.plugins.barcodeScanner.scan(
    function (result) {
      console.log("We got a barcode\n" +
              "Result: " + result.text + "\n" +
              "Format: " + result.format + "\n" +
              "Cancelled: " + result.cancelled);
      $$("#code").val(result.text)
      mainView.router.navigate({
        name: "product",
        params: { id: result.text }
      })
    },
    function (error) {
        alert("Scanning failed: " + error);
    }, {
    }
 );
}

if(window.localStorage.getItem("jwt") === null) {
  $$("#signin").removeClass("hidden")
  $$("#signup").removeClass("hidden")
} else {

  app.request({
    url: "https://foxxy.ovh/_db/ema_api/api/auth/ping",
    headers: {
      "X-Session-Id": window.localStorage.getItem("jwt")
    },
    error: function() {
      window.localStorage.removeItem("jwt")
      $$("#fav").addClass("hidden")
      $$("#logout").addClass("hidden")
      $$("#signin").removeClass("hidden")
      $$("#signup").removeClass("hidden")
    }
  })

  $$("#fav").removeClass("hidden")
  $$("#logout").removeClass("hidden")
  $$("#signin").addClass("hidden")
  $$("#signup").addClass("hidden")
}

$$("#logout").on("click", function() {
  $$("#fav").addClass("hidden")
  $$("#logout").addClass("hidden")
  $$("#signin").removeClass("hidden")
  $$("#signup").removeClass("hidden")
  window.localStorage.removeItem("jwt")
})

$$("#signin-btn").on("click", function(e) {
  app.request.post("https://foxxy.ovh/_db/ema_api/api/auth/login", JSON.stringify({
    "email": $$("#username").val(),
    "password": $$("#password").val()
  }), function(data, s, h){
    data = JSON.parse(data)
    if(data.success) {
      window.localStorage.setItem("jwt", h.getResponseHeader('X-Session-Id'))
      $$("#fav").removeClass("hidden")
      $$("#logout").removeClass("hidden")
      $$("#signin").addClass("hidden")
      $$("#signup").addClass("hidden")
      $$(".modal-in").addClass("modal-out")
      $$(".modal-in").removeClass("modal-in")
    } else {
      var notificationFull = app.notification.create({
        title: 'FoodWatch',
        titleRightText: 'now',
        subtitle: 'Bad login or password',
        text: 'It looks like you used wrong credentials',
        closeTimeout: 3000,
      });
      notificationFull.open();
    }
  })
})

$$("#getdata").on("click", function(){
  var id = $$("#code").val()
  //var id = "3029330003533"
  mainView.router.navigate({
    name: "product",
    params: { id: id }
  })
})

$$("#scan").on("click", function(){
  codebar()
})

