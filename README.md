[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/-tDKPlyU)
**Sylius**

O [Sylius](https://github.com/Sylius/Sylius ) é um framework de comércio eletrônico de código aberto, que fornece uma estrutura modular e flexível para construir lojas online personalizadas. O Sylius é altamente configurável e possui recursos avançados para gerenciamento de catálogo, pedidos, pagamentos e envio, entre outros aspectos do comércio eletrônico. Ele é amplamente utilizado pela comunidade de desenvolvedores para criar lojas online escaláveis e adaptáveis. Neste exercício, vamos realizar testes de GUI em uma loja recém criada pelo Sylius (mostruário), utilizando os frameworks Cypress e Selenium.

**Ferramentas de Teste de GUI**

O [Cypress](https://www.cypress.io ) é um framework de automação de testes de GUI de código aberto que permite a escrita e execução de scripts de teste de forma rápida e confiável. Ele se destaca por sua abordagem de execução dentro do navegador, permitindo interações em tempo real com os elementos da interface. Além disso, ele oferece uma API intuitiva para escrever testes em JavaScript e suporta várias asserções para verificar os resultados esperados.

O [Selenium](https://selenium.dev) é um framework de código aberto para automação de testes de GUI em aplicativos web. Ele permite a interação com elementos da GUI, simula ações do usuário e verifica resultados automaticamente. Dentre seus componentes, o Selenium WebDriver é o mais proeminente, suportando diversas linguagens de programação e permitindo automação em diferentes navegadores. No exercício, utilizaremos o Selenium com a linguagem JavaScript e Mocha.
Aplicação alvo

**Descrição do Exercício**

Para realizar o exercício, você irá utilizar a loja de mostruário fornecida pelo Sylius. A loja possui duas partes: a parte de vendas e a parte administrativa. Na parte de vendas é possível realizar ações de um usuário interessado em comprar os produtos expostos, como buscar por produtos específicos, adicioná-los no carrinho de compras, fazer o check in e etc. Na parte administrativa, podemos gerenciar a parte de vendas, sendo possível cadastrar e editar produtos, categorias, cupons e diversas outras funcionalidades.

Para facilitar a utilização da aplicação alvo, foi criado uma imagem docker capaz de subir todos os serviços necessários para aplicação (php, nginx e banco), além de instalar a última versão da loja de mostruário, tudo em um único container. Subimos e disponibilizamos essa imagem em um registry próprio. O Dockerfile dessa imagem encontra-se [nesse repositório](https://github.com/andriellyll/sylius-showcase-docker), juntamente com os comandos necessários para realizar o pull dessa imagem, o run do container e o carregamento dos dados de exemplo no banco (detalhes no README2.md). É necessário ter o Docker instalado na máquina. Aconselhamos utilizar uma distribuição linux, como Ubuntu, na sua máquina.

Se tiver dificuldade em subir a aplicação, procurare a orientação de José Neto (joserocha@copin.ufcg.edu.br).

**Objetivo**

Cada aluno será direcionado (ver [planilha](https://docs.google.com/spreadsheets/d/1CLRQP1kFan2i89rfdfEcupHl_NUOH2eLyvq3E1sJpe8/edit?usp=sharing)) a testar uma seção específica da parte administrativa (produtos, categorias, cupons e etc) do Sylius. Para tal, deve desenvolver, **no mínimo 10 casos de teste usando o Cypress e os mesmos casos de teste usando o Selenium, totalizando no mínimo 20 casos de teste**. Cada caso de teste deve conter no mínimo **4 interações com a aplicação**, ou seja, quatro ações executadas no site, como clicar em botões, preencher inputs, navegar entre páginas etc. Além das interações, cada caso de teste deve incluir pelo menos um assert, ou seja, uma verificação para validar se o resultado esperado foi alcançado.

Você tem liberdade para criar testes nas duas partes da loja, por exemplo: cadastrar um novo produto na parte de administração e adicionar o produto ao carrinho na parte de vendas. O objetivo é desenvolver uma suíte de teste para a seção designada, abrangendo diferentes funcionalidades e cenários de uso daquela seção. 

Para executar o exercício, você deve partir deste repositório onde o Cypress e Selenium estão configurados e complementar os scripts de teste criados para as duas ferramentas considerando às seções direcionadas. Os scripts contém o primeiro caso de teste que servirá como exemplo. Ou seja, não tem como tirar 0. Você deve completar seus respectivos scripts com no mínimo + 9 casos de teste para cada framework. Exemplo: cypress/e2e/products.cy.js para Cypress e selenium/e2e/products.js para Selenium. 

Dependência para auxiliar a implementação de testes no Cypress: 
[https://testing-library.com/docs/cypress-testing-library/intro]

**Setup do Ambiente (Windows)**

- Pré-requisitos
  - Instale/tenha disponível no Windows:
    - Docker Desktop (modo Linux containers)
    - Git
    - Node.js (LTS) (vem com npm)
    - VS Code (opcional, mas recomendado)

1) Subir o Sylius (aplicação a ser testada)
1.1) Abrir Docker Desktop

1. Abra o Docker Desktop
2. Aguarde ficar “Docker Desktop is running”
3. Garanta que está em Linux containers

1.2) Estrutura do projeto Sylius

Entre na pasta em que seu projeto está

1.4) Subir containers

Na pasta do Sylius:
docker compose up -d
docker compose ps

1.5) Instalar dependências PHP (Composer)

docker exec -it sylius-project-php-1 composer install

1.6) Compilar assets (Admin/Shop) com Node

via Node local: 

npm install
npm run build

**Entrega do exercício**

O prazo final para a realização do exercício é **04/03/2026**. 

O que deve ser entregue: 
- Este repositório atualizado com a implementação dos seus casos de teste e configurações feitas
- Preecher o [form de avaliação](https://forms.gle/uQDsFMLaYu948rrPA)

  
**Links úteis**

[Documentação Cypress](https://docs.cypress.io/api/table-of-contents)

[Documentação Selenium](https://www.selenium.dev/documentation/)

[Exemplos feitos na aula]()
