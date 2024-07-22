const { readFile } = require("fs");

function pegarConteudoArquivo(arquivo) {
  return new Promise((resolve, reject) => {
    readFile(arquivo, (error, buffer) => {
      if (error) {
        reject(error);
        return;
      }

      const conteudoArquivo = buffer.toString("utf-8");
      resolve(conteudoArquivo);
    });
  });
}

async function cliente(args, callback){
    let conteudoArquivoEnv;

  try {
    conteudoArquivoEnv = await pegarConteudoArquivo("../genieacs.env");
  } catch (error) {
    console.error("Erro ao ler arquivo .env", error);
    process.exit(-1);
  }

  const linhas = conteudoArquivoEnv.split("\n");

  for (const linha of linhas) {
    const [chave, valor] = linha.split("=");
    process.env[chave] = valor;
  }
  
    var url_base = process.env.HUBSOFT_URL
    var usuario = process.env.HUBSOFT_USUARIO
    var password = process.env.HUBSOFT_SENHA
    var client_secret = process.env.HUBSOFT_CLIENT_SECRET
    var client_id = process.env.HUBSOFT_CLIENT_ID
    var nome_provedor_senha = process.env.HUBSOFT_SENHA_WIFI
    const api = require('./api/hubsoft')
    var responsepostlogin = await api.postLogin(url_base,usuario,password,client_secret,client_id)
    var responsegetMacAddress = await api.getMacAddress(responsepostlogin.access_token,url_base,args[0])
    if(responsegetMacAddress.produto.length>0){
        var id_produto_item_status = responsegetMacAddress.produto[0].produto_item_status.id_produto_item_status
        if(id_produto_item_status == 42 || id_produto_item_status == 6 ){
            var id_cliente_servico = responsegetMacAddress.produto[0].cliente_servico.id_cliente_servico
            var retornogetClienteServico = await api.getClienteServico(responsepostlogin.access_token,url_base,id_cliente_servico)
            var nome_razaosocial = retornogetClienteServico.clientes[0].nome_razaosocial
            var codigo_cliente = retornogetClienteServico.clientes[0].codigo_cliente
            var nome_spliter = nome_razaosocial.split(' ')
            var login_pppoe
            var senha_pppoe
            var nome_wifi = nome_spliter[0]+"_"+codigo_cliente
            var senha_wifi = nome_provedor_senha+codigo_cliente
            var cliente_servico = retornogetClienteServico.clientes[0].servicos
            for(i=0; i<cliente_servico.length; i++){
                if(id_cliente_servico == cliente_servico[i].id_cliente_servico){
                        login_pppoe = cliente_servico[i].login
                        senha_pppoe = cliente_servico[i].senha
                        senhas = cliente_servico[i].senhas
                        for(j=0; j<senhas.length; j++ ){
                            if(senhas[j].descricao == "REDE WIFI"){
                                nome_wifi = senhas[j].usuario
                                senha_wifi = senhas[j].senha
                                break
                            }
                        }
                        var result = {
                            "login_pppoe": login_pppoe,
                            "senha_pppoe": senha_pppoe,
                            "nome_wifi": nome_wifi,
                            "senha_wifi": senha_wifi,
                            "nome_wifi_5g": nome_wifi+"_5G"
                        }
                        callback(null,result)
                        break
                }
            }
        }else if(id_produto_item_status == 13){
            var id_usuario = responsegetMacAddress.produto[0].usuario.id_usuario
            var responselistOrdemServico = await api.listOrdemServico(responsepostlogin.access_token,url_base,id_usuario)
            if(responselistOrdemServico.ordens_servico.length>0){
                var numero_ordem_servico = responselistOrdemServico.ordens_servico[0].numero
                var responsegetOrdemServico = await api.getOrdemServico(responsepostlogin.access_token,url_base,numero_ordem_servico)
                if(responsegetOrdemServico.ordens_servico.length>0){
                    var id_cliente_servico = responsegetOrdemServico.ordens_servico[0].servico.id_cliente_servico
                    var retornogetClienteServico = await api.getClienteServico(responsepostlogin.access_token,url_base,id_cliente_servico)
                    var nome_razaosocial = retornogetClienteServico.clientes[0].nome_razaosocial
                    var codigo_cliente = retornogetClienteServico.clientes[0].codigo_cliente
                    var nome_spliter = nome_razaosocial.split(' ')
                    var login_pppoe
                    var senha_pppoe
                    var nome_wifi = nome_spliter[0]+"_"+codigo_cliente
                    var senha_wifi = nome_provedor_senha+codigo_cliente
                    var cliente_servico = retornogetClienteServico.clientes[0].servicos
                    for(i=0; i<cliente_servico.length; i++){
                        if(id_cliente_servico == cliente_servico[i].id_cliente_servico){
                                login_pppoe = cliente_servico[i].login
                                senha_pppoe = cliente_servico[i].senha
                                senhas = cliente_servico[i].senhas
                                for(j=0; j<senhas.length; j++ ){
                                    if(senhas[j].descricao == "REDE WIFI"){
                                        nome_wifi = senhas[j].usuario
                                        senha_wifi = senhas[j].senha
                                        break
                                    }
                                }
                                var result = {
                                    "login_pppoe": login_pppoe,
                                    "senha_pppoe": senha_pppoe,
                                    "nome_wifi": nome_wifi,
                                    "senha_wifi": senha_wifi,
                                    "nome_wifi_5g": nome_wifi+"_5G"
                                }
                                callback(null,result)
                                break
                        }
                    }
                }else{
                    callback(null,"Nenhuma O.S encontrada"+args[0])
                } 
            }else{
                callback(null,"Nenhuma O.S encontrada"+ args[0])
            }
            
        }else{
            callback(null,"Mac nao esta com tecnico e nem vinculado ao cliente "+args[0])
        }
    }else{
        callback(null,"Mac nao existe no sistema "+args[0])
    }
}


exports.getCliente = cliente;
