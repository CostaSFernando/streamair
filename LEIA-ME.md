# Site Stream Air: HTML + CSS estático

```
index.html        a página
styles.css        todo o visual
script.js         animações e o formulário de orçamento
img/              fotos e logo (tiradas do site atual)
Dockerfile        para rodar no Portainer/Docker (nginx)
docker-compose.yml
.nojekyll         para o GitHub Pages servir os arquivos sem processar
```

Não precisa de Node, build ou banco de dados. Abrir o `index.html` no navegador já funciona.

## Antes de publicar

- Formulário: hoje ele abre o e-mail do visitante já preenchido. Para receber direto,
  use um serviço gratuito como Formspree ou Web3Forms e troque o `action` do `<form id="cform">`.

## Opção 1: GitHub Pages (grátis)

1. Crie um repositório no GitHub (ex.: `streamair-site`), público.
2. Envie o conteúdo desta pasta (não a pasta em si) para a branch `main`.
   Pelo site: **Add file > Upload files** e arraste tudo, inclusive a pasta `img`.
3. **Settings > Pages > Build and deployment**: Source = *Deploy from a branch*,
   Branch = `main` / `/ (root)`. Salve.
4. Em 1–2 minutos o site fica em `https://SEU-USUARIO.github.io/streamair-site/`.
5. Domínio próprio: em **Settings > Pages > Custom domain** digite `streamair.com.au`
   e, no painel de DNS do domínio, crie os registros que o GitHub indicar
   (A para 185.199.108.153, .109, .110, .111 e CNAME `www` para `SEU-USUARIO.github.io`).
   **Só faça isso quando quiser tirar o WordPress do ar**: o domínio passa a apontar para o novo site.

## Opção 2: Portainer (servidor próprio com Docker)

1. Coloque esta pasta num repositório Git (ou no servidor).
2. No Portainer: **Stacks > Add stack > Repository** (aponte para o repositório)
   ou **Upload/Web editor** com o `docker-compose.yml`.
3. Faça o deploy. O site abre em `http://IP-DO-SERVIDOR:8080`.
4. Para o domínio e HTTPS, coloque um proxy reverso na frente (Nginx Proxy Manager,
   Traefik ou Caddy) apontando `streamair.com.au` para a porta 8080.

Atenção: o Portainer não é hospedagem gratuita por si só; ele precisa de um servidor
(VPS ou máquina sua) ligado 24h. Para custo zero, o GitHub Pages é o caminho mais simples.

## Antes de desligar o WordPress

- Faça um backup completo do WordPress (arquivos + banco).
- Os e-mails `@streamair.com.au` não dependem do site, mas confira onde o DNS de e-mail
  (registros MX) está antes de mexer no DNS.
