# Modulo de integração GenieACS + (Hubsoft) V2.0
Antes de iniciar com o tutorial dessa nova versão, gostaria de agradecer a todos que demostraram interesse pela versão 1. Agradecer também pelo o apoio do time da Hubsoft que sempre atendeu minhas sugestões de melhorias, tanto na API pública, como na integração com o GenieACS.

## Motivação!!!
A motivação desse novo módulo, foi exemplificar o processo de integração, deixando mais fácil e prático para qualquer pessoa conseguir configurar.


## Quais as diferenças entre a primeira versão e a segunda versão ?
Em ambas versões as funções de autoconfiguração dos equipamentos, tanto em casos de reset como na primeira instalação continuam funcionando.

Todavia, na versão 2.0 não iremos mais necessitar de acesso ao banco de dados da Hubsoft (O que deixava algumas pessoas com receio de utilizar a integração v1).

Nessa versão iremos utilizar a API pública da Hubsoft, que ganhou novas rotas dentro da api, possibilitando assim essa nova versão da integração.

Além disso, os arquivos de provisionamento estão divido por modelos, com isso vocês poderão escolher os modelos à serem utilizados.

Como também, os códigos estão mais limpos para melhor entendimento e futuras modificações.

E como prometido o nome e senha do Wi-Fi, podem ser definidos no momento do provisionamento da onu/ont ou registrando o nome e a senha manualmente durante a execução da Ordem de Serviço, na opção de documentação de senha do serviço do cliente, com a descrição da senha: SENHA DO WIFI (haverá uma seção nesse tutorial, sobre essa função).

## Requisitos para funcionamento da integração

Para esse projeto funcionar corretamente, quando o roteador novo estiver sendo instalado, é necessário que o Técnico esteja com a Ordem de Serviço em execução e o equipamento (CPE) no estoque do Técnico.

Além disso todos as CPE precisa obrigatóriamente conter o MAC LAN do roteador *(É o mesmo mac que vem no fundo do Roteador e na caixa do equipamento)* dentro do campo mac do produto, que pode ser adicionado no momento do cadastro da compra do produto ou editado em estoque->itens de produto.

Caso de reset, o roteador deve está vinculado ao cliente, em Equipamentos do cliente com o status "Remessa" ou "Comodato".


#

## Instalação do GenieACS
### Requisitos:
- Debian 11 - Baixe a ISO DVD completo, pois os espelhos não estão ficando disponiveis. (https://cdimage.debian.org/cdimage/archive/11.10.0/amd64/iso-dvd/debian-11.10.0-amd64-DVD-1.iso);
- Não utilizar CGNAT entre o servidor e o roteador/ont;
- Execute todos os comandos em modo root no servidor.

### 1º Adicione contrib non-free aos repositórios
Acesse o arquivo `/etc/apt/sources.list`. Você pode optar por comentar as linhas atuais com `#` na frente de cada linha e colocar o código abaixo:

```shell
deb http://deb.debian.org/debian/ bullseye main contrib non-free
deb-src http://deb.debian.org/debian/ bullseye main contrib non-free

deb http://security.debian.org/debian-security bullseye-security main contrib non-free
deb-src http://security.debian.org/debian-security bullseye-security main contrib non-free

deb http://deb.debian.org/debian/ bullseye-updates main contrib non-free
deb-src http://deb.debian.org/debian/ bullseye-updates main contrib non-free
```

### 2º Atualize os repositórios e atualize os pacotes
```shell
apt update && apt upgrade -y
```

### 3º Instale os firmware-linux* e reinicie o servidor logo após a instalação

```shell
apt install firmware-linux firmware-linux-free firmware-linux-nonfree -y
systemctl reboot
```

### 4º Instalação do `nodejs`
Execute os comandos abaixo, linha por linha.

```shell
apt install curl gnupg2 wget
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install nodejs -y
```

Verifique se existe alguma atualização do nodejs, se houver execute o 2 segundo comando abaixo, alterando para a versão disponível.

```shell
npm search -g npm
npm install -g npm@10.8.2
```

### 5º Instalação MongoDB
Utilizaremos a versão 4.4 do MongoDB, nos meus teste é a unica que roda na primeira tentativa e sem falhas.</br>
Se estiver com IPv6 ativo no servidor desative, houve falha no comando wget com o IPv6 ativado no servidor.

```shell
cd /tmp
echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -
apt update
apt install mongodb-org node-mongodb
```

**Ative o mongoDB:**

```shell
systemctl enable mongod
systemctl start mongod
systemctl status mongod
```

### 6º Instalando o GenieACS
Execute cada linha individualmente, não copie e cole tudo de uma vez (Válido para todos os comandos nesse tutorial).

```shell
npm install -g genieacs
apt install sudo
sudo useradd --system --no-create-home --user-group genieacs
mkdir /opt/genieacs
mkdir /opt/genieacs/ext
```

Vamos precisar criar um arquivo `.env` dentro do diretório `/opt/genieacs/`.

Nesse momento é necessário que você crie um usuário no Hubsoft com acesso a API.

Não é necessário liberar as permissões da API dentro do guia permissão do usuário, basta apenas ativar a opção no guia API no usuário.

https://wiki.hubsoft.com.br/pt-br/modulos/perguntas-frequentes/atualizacao-seguranca-autenticacao-api

Recomendo deixar os logs inativos, ative somente em caso de Debug. Acesse o arquivo `/opt/genieacs/genieacs.env`:

```shell
#GENIEACS_CWMP_ACCESS_LOG_FILE=/var/log/genieacs/genieacs-cwmp-access.log
#GENIEACS_NBI_ACCESS_LOG_FILE=/var/log/genieacs/genieacs-nbi-access.log
#GENIEACS_FS_ACCESS_LOG_FILE=/var/log/genieacs/genieacs-fs-access.log
#GENIEACS_UI_ACCESS_LOG_FILE=/var/log/genieacs/genieacs-ui-access.log
#GENIEACS_DEBUG_FILE=/var/log/genieacs/genieacs-debug.yaml
NODE_OPTIONS=--enable-source-maps
GENIEACS_EXT_DIR=/opt/genieacs/ext
GENIEACS_EXT_TIMEOUT=15000
GENIEACS_UI_JWT_SECRET=secret
HUBSOFT_URL=url_do_sistema
HUBSOFT_USUARIO=email_usuario
HUBSOFT_SENHA=senha_do_usuario
HUBSOFT_CLIENT_SECRET=disponivel_no_usuario
HUBSOFT_CLIENT_ID=disponivel_no_usuario
HUBSOFT_SENHA_WIFI=Senha_padrao_wifi
```
A variável `HUBSOFT_SENHA_WIFI`, será utilizada quando não for encontrada senha na documentação de senhas no serviço do cliente (tanto para nova instalação, como para reset de roteador/ont).

A senha do wifi será o conteúdo da variável `HUBSOFT_SENHA_WIFI` + o código do cliente no Hubsoft (localizado na frente do nome do cliente no sistema).

**Concedendo as permissões nas pastas e arquivos criados.**

```shell
chown genieacs. /opt/genieacs -R
chmod 600 /opt/genieacs/genieacs.env
```

**Crie as pastas para os logs**

```shell
mkdir /var/log/genieacs
chown genieacs. /var/log/genieacs
```

**Configurando os serviços no systemd**

- **Edite a Unit `genieacs-cwmp`**

```shell
systemctl edit --force --full genieacs-cwmp
```

Cole o contéudo abaixo:

```shell
[Unit]
Description=GenieACS CWMP
After=network.target

[Service]
User=genieacs
EnvironmentFile=/opt/genieacs/genieacs.env
ExecStart=/usr/bin/genieacs-cwmp

[Install]
WantedBy=default.target
```

- **Edite a Unit `genieacs-nbi`**

```shell
systemctl edit --force --full genieacs-nbi
```

Cole o contéudo abaixo:

```shell
[Unit]
Description=GenieACS NBI
After=network.target
[Service]
User=genieacs
EnvironmentFile=/opt/genieacs/genieacs.env
ExecStart=/usr/bin/genieacs-nbi
[Install]
WantedBy=default.target
```

- **Edite a Unit `genieacs-fs`**

```shell
systemctl edit --force --full genieacs-fs
```

Cole o contéudo abaixo:

```shell
[Unit]
Description=GenieACS FS
After=network.target

[Service]
User=genieacs
EnvironmentFile=/opt/genieacs/genieacs.env
ExecStart=/usr/bin/genieacs-fs

[Install]
WantedBy=default.target
```

- **Edite a Unit genieacs-ui**

```shell
systemctl edit --force --full genieacs-ui
```

Cole o contéudo abaixo:

```shell
[Unit]
Description=GenieACS UI
After=network.target

[Service]
User=genieacs
EnvironmentFile=/opt/genieacs/genieacs.env
ExecStart=/usr/bin/genieacs-ui

[Install]
WantedBy=default.target
```

**Configure o logrotate para rotação dos log gerados**

Edite `/etc/logrotate.d/genieacs`:

```shell
/var/log/genieacs/*.log /var/log/genieacs/*.yaml {
daily
rotate 30
compress
delaycompress
dateext
}
```

**Agora vamos inciar o GenieACS:**

```shell
systemctl enable genieacs-cwmp genieacs-nbi genieacs-fs genieacs-ui
systemctl start genieacs-cwmp genieacs-nbi genieacs-fs genieacs-ui
systemctl status genieacs-cwmp genieacs-nbi genieacs-fs genieacs-ui --no-pager
```

### 7º Instalando o modulo de integração
Instalando o git:

```shell
apt install git
```

Clonando os arquivos do github para a pasta ext do genieacs:

```shell
git clone https://github.com/redetuxnet/GenieACS_V2.git /opt/genieacs/ext
```

Precisamos instalar duas dependências para o script de integração funcionar. Iremos instalar os pacotes `request` e a `fs`.

```shell
cd /opt/genieacs/ext
npm install fs
cd /opt/genieacs/ext/api
npm install request
```

### 8º Acessando a interface Web do GenieACS
Para seu primeiro acesso, acesse o ip do servidor com a porta 3000.

> **IMPORTANTE:** Na instalação não configuramos o SSL, logo a url não suporta `https`, use apenas o `http` para o acesso via web:

    http://<seu_ip>:3000

Após acessar, clique no botão `ABRACADABRA` e depois no botão `Open Sesame`.

Depois disso, será redirecionado para a página de login, onde o usuário e senha é admin.

### 9º Criando Virtual Parameters
Nesse momento iremos criar 4 virtuais parametros que irá auxiliar nos scritps e na integração com o Hubsoft.

Os scripts dos Virutal Parameters estão localizado em /opt/genieacs/ext/virtual_parameters ou no git <https://github.com/redetuxnet/GenieACS_V2/tree/main/virtual_parameters>

Acesse o GenieACS e navegue até `admin` -> `Virtual Parameters`

O primeiro Virtual Parametro que iremos criar é o `MACAddress`:
1. Clique em _**new**_;
2. No campo name coloque o `MACAddress`;
3. Copie o script dentro do arquivo `MACAddress` no diretório informado acima e cole dentro do campo Script no GenieACS.

O segundo Virtual Parametro que iremos criar é o `MAC`:
1. Clique em _**new**_;
2. no campo name coloque o `MAC`;
3. Copie o script dentro do arquivo MAC no diretório informado acima e cole dentro do campo Script no GenieACS.

O terceiro Virtual Parametro que iremos criar é o `Ip`:
1. Clique em _**new**_;
2. no campo name coloque o `Ip`
3. Copie o script dentro do arquivo Ip no diretório informado acima e cole dentro do campo Script no GenieACS.

O quarto Virtual Parametro que iremos criar é o `ppp_username`:
1. Clique em _**new**_;
2. no campo name coloque o ppp_username
3. Copie o script dentro do arquivo ppp_username no diretório informado acima e cole dentro do campo Script no GenieACS

E continue criandos todos os demais Virtual Parametros que estão dentro da Pasta Virtual_parameters

### 10º Criando os arquivos de provisionamento e presets.

Antes de adicionarmos os provisionamentos para cada modelo que será utilizado, precisamos editar dois provisionamentos que já estão criados, são os: `defaults` e `inform`.

#### O primeiro que iremos editar é o provision `default`.

- Copie as informações que estão no projeto dentro da pasta `/opt/genieacs/ext/provisions/default` ou no git https://github.com/redetuxnet/GenieACS_V2/tree/main/provisions.

- Dentro do GenieACS navegue até admin -> provisions. Clique em show no provision com o nome default e apague tudo que está dentro e cole o contéudo copiado do arquivo default do projeto

#### O segundo que iremos editar é o provision `inform`.

- Copie as informações que está no projeto dentro da pasta
    /opt/genieacs/ext/provisions/inform ou no git https://github.com/redetuxnet/GenieACS_V2/tree/main/provisions
- Dentro do GenieACS navegue até admin -> provisions
- Clique em show no provision com o nome inform e apague tudo que está dentro e cole o contéudo copiado do arquivo default do projeto

#### Criando o presets e provisionamentos (existe um arquivo para cada modelo de roteador/ont)**

- Escolha qual modelo que irá utilizar e Copie as informações que está no projeto dentro da pasta `/opt/genieacs/ext/provisions/` ou no git https://github.com/redetuxnet/GenieACS_V2/tree/main/provisions.

- Dentro do GenieACS navegue até `admin` -> `provisions`.
- Clique em new no campo script coloque o codigo contido no arquivo escolhido e no nome digite o nome do arquivo escolhido e salve.

Após criar o provision vamos no campo `presets`, onde vamos acionar nossos provisions `admin` -> `presets`.
Clique em _**new**_ e prencha os dados conforme abaixo:

```
name: nome_do_arquivo_do_provisionamento
channel: nome_do_arquivo_do_provisionamento
Weigth: 0
Events: 1 BOOT (Recomendado - vai acionar quando o roteador reiniciar) ou Registered (vai acionar quando roteador conectar a primeira vez no genieacs)
Precondition: Copie a primeira linha de dentro do arquivo de provisionamento escolhido.
Provision: nome_do_arquivo_do_provisionamento
```

**No precondition, que será copiado do arquivo do provisionamento, contém o usuário padrão `tr069` para validar se o roteador já está configurado ou não, pode ser alterado para o pppoe que será utilizado no preset do roteador.**

> **IMPORTANTE**: Dentro dos scripts existem os parametros que serão usados para setar as informações no roteador. um exemplo é o usuário de conexão pppoe, nesses paramentros existem instâncias dos objetos. no momento que você cria o preset de firmware a instância do objeto que envia os dados do usuário de pppoe, pode está diferente do script de provisionamento.

```
Exemplo de paramentro:
InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.Username
```

Nesse exemplo acima as instâncias estão com o numero `1`, mas no seu podem estar diferentes. Caso esteja, apenas mude o número da instância que apresenta no roteador (geralmente muda apenas a segunda instância do parâmetro (segundo número depois dos textos).

Para verificar o parametro correto, atualize toda a árvore de parametros, basta apenas consulta o parametro e esperar os dados atualizar.

```
Parametro para consulta: InternetGatewayDevice
```

Após isso, consulte o ultimo valor do parametro, exemplo: consulte a palavra `Username` no campo de busca dos parametros dentro das configurações do roteador no GenieACS e compare com o parâmetro que está no script.

### 11º Protegendo a conexão entre o roteador e o servidor

Para assegurar uma comunicação segura, precisamos criar uma senha de conexão do roteador para servidor e virse-versa</br>

Para proteger a conexão do roteador para o servidor, acesse o menu admin -> config clique em _**new config**_:

- Em key adicione: `cwmp.auth`
- Em Value adcione: `AUTH("usuario", "senha")`

> _Adicione em AUTH o usuário e a senha que definiu no roteador para a conexão com ACS_

Para proteger a conexão do servidor para o roteador, acesse o menu `admin` -> `config` clique em _**new config**_:

- Em key adicione: `cwmp.connectionRequestAuth`
- Em Value adcione: `AUTH("usuario", "senha")`

> _Adicione em AUTH o usuário e a senha que definiu no roteador para a conexão de requisição originida do servidor._

## Configuração GenieACS no Hubsoft

Dentro da wiki do hubsoft se encontra o precedimento para adicionar a integração do lado do ERP com o GenieACS e como definir os parametros customizados para cada tipo de roteador.

Documentação para integração: https://wiki.hubsoft.com.br/pt-br/modulos/configuracao/integracao/gerenciador_cpe/integrar-cpe

Documentação parâmetro customizado:
https://wiki.hubsoft.com.br/pt-br/atualizacoes/versao_1_94#h-22-melhorias-na-integra%C3%A7%C3%A3o-genieacs

Documentação parâmetro customizado para a LAN:
https://wiki.hubsoft.com.br/pt-br/atualizacoes/versao_1_106#h-6-personalizar-par%C3%A2metros-de-coleta-de-dados-lan-cpe

**IMPORTANTE**: A API do GenieACS não possui token e nem autenticação para acesso, logo não deixe a porta 7557 exposta para a internet, coloque o firewall liberando o acesso apenas para o IP do seu Hubsoft.

## Nome e Senha do WiFi
Nessa atualização foi desenvolvida a opção de leitura do nome e senha para o Wi-Fi, isso permite que o nome e senha do wifi, possa ser inserida sem acessar as configurações do roteador/ont.

Existem dois modos de definir o nome e senha do Wi-Fi. A primeira via provisionamento da ont/onu e a segunda definindo manualmente dentro da opção de documentação de senhas do serviço do cliente.

Para a opção via provisionamento é necessário ativar duas configurações no Hubsoft:

1- Ative a opção Suporte WiFi (não ative a opção Suporte WiFi 5G), dentro do perfil de provisionamento da cpe (Recomendo ativar em todos os perfis), localizado em Configurações -> Redes -> Perfis de CPE.

2- Ative a variável "DOCUMENTAR_WIFI_AO_PROVISIONAR_CPE" e definir como verdadeira, localizado em Configurações -> Geral -> Variaveis.
Feito as ativações dentro do Hubsoft, só basta preecnher as informações no momento do provisionamento nas variáveis de nome do wifi e a senha.

Para a opção via documentação de senhas, acesse a opção documentação de senhas do serviço do cliente, disponível tanto na versão web como no aplicativo do técnico.

Após acessar documentação de senhas, clique em adicionar "+" e preecha o campo descrição com "REDE WIFI" sem aspas, no campo usuário digite o nome do WiFi e na senha digite a senha do WiFi.

O nome padrão para o Wi-Fi em caso que não seja encontrado no sistema, será Utilizado PRIMEIRO_NOME_DO_CLIENTE + CODIGO_DO_CLIENTE (JEFFSON_5867).

A senha padrão para o Wi-Fi em caso que não seja encontrado no sistema, será Utilizado a variável HUBSOFT_SENHA_WIFI+CODIGO_DO_CLIENTE (Hubnet5867)

**IMPORTANTE**: Caso o cliente altere a senha do Wi-Fi via aplicativo ou mesmo direto no equipamento, não será atualizado na documentação de senhas logo se houver o reset retornará a ultima senha registrada, caso queira que a informações seja alterada na documentação de senha deve ser atualizado manualmente no sistema.

## Preset de firmware

Todos os roteadores que for ser utilizado é recomendo o uso do preset (firmware customizado), para adicionar o valores padrões.</br> cada fabricante tem um modo de subir o preset consulte seu fornecedor. </br>
lembre-se que no preset é necessário apenas os
- Usuario padrão "tr069" e a senha do pppoe.
- Dados do tr069 preenchidos.
- Senha padrão de acesso web.
- Se a empresa usar acesso remoto habilitar
-  Alterar porta padrão de acesso web.

Dados do tr069 para ser prenchidos
- url (http://ipdoservidor:7547)
- nome de usuario (usuario que foi criado no genieacs)
- senha (senha que foi criada no genieacs)
- Informativos periódicos: Habilitado
- Intervalo de Informativos periódicos: 300
- Caminho: /tr069 (se houver)
- Porta: 7547

Lembrando que não pode possuir NAT e nem CGNAT entre o servidor e os roteadores.

#
### Referências
- https://blog.remontti.com.br/6001
- https://docs.hubsoft.com.br/
- https://wiki.hubsoft.com.br/pt-br/home
- https://genieacs.com/docs/
- https://docs.genieacs.com/en/latest/

## Contatos e Suporte
- E-mail: jeffsonvitor69@gmail.com
- Telegram: https://t.me/jeffsoncavalcante