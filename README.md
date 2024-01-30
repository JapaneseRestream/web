# JapaneseRestream/web

## Create certificates for local development

1. Install `mkcert`: https://github.com/FiloSottile/mkcert
1. Generate certificate
   ```
   mkcert -install
   cd local-proxy
   mkcert www.japanese-restream.org.localhost
   ```
