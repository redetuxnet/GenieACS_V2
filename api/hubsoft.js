exports.postLogin = function(url_base,username,password,client_secret,client_id){
    var request = require('request')
    var postData = {
        "grant_type":"password",
        "client_id":client_id,
        "client_secret":client_secret,
        "username":username,
        "password":password
      }
      
      var url = url_base+'/oauth/token'
      var options = {
        method: 'post',
        body: postData,
        json: true,
        url: url
      }

      var customPromise = new Promise((resolve, reject)=> {

        request(options, function (err, res, body) {
            if (err) {
              reject(eer)
            }else{
              resolve(body)
            }
          })

      })
      return customPromise
}

exports.getMacAddress = function(token,url_base,mac){
  var request = require("request");
  const headers = {
    Accept: "application/json",
    Authorization: "Bearer " + token
  };
  var url = `${url_base}/api/v1/integracao/estoque/produto_item/consultar?busca=mac_address&termo_busca=${mac}`;
  var options = {
    method: "get",
    headers,
    json: true,
    url: url,
  };

  var customPromise = new Promise((resolve, reject) => {
    request(options, function (err, res, body) {
      if (err) {
        console.error("error posting json: ", err);
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
  return customPromise;
}

exports.listOrdemServico = function(token,url_base,id_tecnico){
    var request = require("request");
    const headers = {
      Accept: "application/json",
      Authorization: "Bearer " + token
    };
    var day = new Date().getDate();
    var moth = new Date().getMonth();
    var year = new Date().getFullYear();
    var data_atual =
      adicionaZero(year) +
      "-" +
      adicionaZero(moth + 1) +
      "-" +
      adicionaZero(day);
      function adicionaZero(numero) {
        if (numero <= 9) return "0" + numero;
        else return numero;
      }
    var url = `${url_base}/api/v1/integracao/ordem_servico/todos?pagina=0&itens_por_pagina=1&data_inicio=${data_atual}&data_fim=${data_atual}&tipo_data=data_inicio_executado&status=pendente&tecnico=${id_tecnico}`;
    var options = {
      method: "get",
      headers,
      json: true,
      url: url,
    };
  
    var customPromise = new Promise((resolve, reject) => {
      request(options, function (err, res, body) {
        if (err) {
          console.error("error posting json: ", err);
          reject(err);
        } else {
          resolve(body);
        }
      });
    });
    return customPromise;
  }

exports.getOrdemServico = function(token,url_base,numero_os){
    var request = require("request");
    const headers = {
      Accept: "application/json",
      Authorization: "Bearer " + token
    };
    
    var url = `${url_base}/api/v1/integracao/cliente/ordem_servico?termo_busca=${numero_os}&busca=numero_ordem_servico`;
    var options = {
      method: "get",
      headers,
      json: true,
      url: url,
    };
  
    var customPromise = new Promise((resolve, reject) => {
      request(options, function (err, res, body) {
        if (err) {
          console.error("error posting json: ", err);
          reject(err);
        } else {
          resolve(body);
        }
      });
    });
    return customPromise;
  }

exports.getClienteServico = function(token,url_base,id_cliente_servico){
    var request = require("request");
    const headers = {
      Accept: "application/json",
      Authorization: "Bearer " + token
    };
    
    var url = `${url_base}/api/v1/integracao/cliente?busca=id_cliente_servico&termo_busca=${id_cliente_servico}&servico_status=servico_habilitado`;
    var options = {
      method: "get",
      headers,
      json: true,
      url: url,
    };
  
    var customPromise = new Promise((resolve, reject) => {
      request(options, function (err, res, body) {
        if (err) {
          console.error("error posting json: ", err);
          reject(err);
        } else {
          resolve(body);
        }
      });
    });
    return customPromise;
  }