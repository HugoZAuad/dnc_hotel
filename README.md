# dnc_hotel

## Descrição do Projeto

O **dnc_hotel** é uma API backend desenvolvida com NestJS para gerenciar um sistema de reservas de hotéis. O sistema permite o cadastro e autenticação de usuários, gerenciamento de hotéis, realização e controle de reservas, além do upload de imagens para usuários e hotéis. A aplicação é estruturada em módulos, seguindo boas práticas de desenvolvimento e arquitetura limpa.

---

## Tecnologias Utilizadas

- **NestJS**: Framework Node.js para construção de aplicações backend escaláveis e estruturadas.
- **Prisma ORM**: ORM para acesso e manipulação do banco de dados PostgreSQL, facilitando a modelagem e consultas.
- **PostgreSQL**: Banco de dados relacional utilizado para armazenar dados de usuários, hotéis e reservas.
- **JWT (JSON Web Token)**: Utilizado para autenticação e autorização segura dos usuários.
- **Redis**: Utilizado para cache e gerenciamento de sessões.
- **Nodemailer (MailerModule)**: Para envio de e-mails, configurado via SMTP.
- **Multer**: Middleware para upload de arquivos, usado para armazenar imagens de usuários e hotéis.
- **ThrottlerModule**: Implementa limitação de requisições para proteger a API contra abusos.
- **CORS**: Configurado para permitir requisições do frontend hospedado em `http://localhost:3001`.
- **ValidationPipe**: Validação automática dos dados recebidos via DTOs.
- **Interceptors e Middlewares**: Para logging, validação e segurança das rotas.

---

## Estrutura do Projeto

O projeto está organizado em módulos principais, cada um responsável por uma área funcional:

- **AuthModule**: Gerencia autenticação via JWT, incluindo login, registro, recuperação e redefinição de senha.
- **UserModule**: Gerencia usuários, incluindo criação, atualização, exclusão e upload de avatar.
- **HotelsModule**: Gerencia hotéis, com funcionalidades para criar, atualizar, deletar, buscar hotéis e upload de imagens.
- **ReservationsModule**: Gerencia reservas, permitindo criar, consultar, atualizar status e listar reservas por usuário.
- **PrismaModule**: Configuração e integração com o Prisma ORM para acesso ao banco de dados.
- **RedisModule**: Configuração para conexão com Redis.
- **Shared**: Contém decorators, guards, interceptors e middlewares compartilhados para segurança e validação.

---

## Funcionamento do Sistema

1. **Autenticação e Autorização**: Usuários se registram e fazem login para obter um token JWT, que deve ser enviado nas requisições protegidas.
2. **Gerenciamento de Usuários**: Usuários podem ser criados, atualizados, deletados e podem fazer upload de avatar.
3. **Gerenciamento de Hotéis**: Usuários autenticados podem criar hotéis, atualizar informações, deletar e fazer upload de imagens para os hotéis.
4. **Reservas**: Usuários podem criar reservas para hotéis, consultar suas reservas, e o status das reservas pode ser atualizado (pendente, aprovado, cancelado).
5. **Validação e Segurança**: Todas as entradas são validadas via DTOs e ValidationPipe. Rotas protegidas por guards e middlewares para garantir segurança e integridade.
6. **Limitação de Requisições**: A API limita o número de requisições para evitar abusos.
7. **Logs e Monitoramento**: Interceptors registram logs das requisições para monitoramento.

---

## Banco de Dados

O banco de dados PostgreSQL possui as seguintes entidades principais:

- **User**: Representa os usuários do sistema, com campos como nome, email, senha, papel (admin ou usuário), avatar, e relacionamentos com hotéis e reservas.
- **Hotel**: Representa os hotéis cadastrados, com nome, descrição, endereço, imagem, preço e dono (usuário).
- **Reservation**: Representa as reservas feitas pelos usuários, com datas de check-in e check-out, total, status (pendente, aprovado, cancelado) e relacionamentos com usuário e hotel.

---

## Como Rodar o Projeto

1. Clone o repositório.
2. Configure as variáveis de ambiente necessárias:
   - `DATABASE_URL`: string de conexão com o banco PostgreSQL.
   - `JWT_SECRET`: segredo para geração de tokens JWT.
   - `SMTP`: configuração SMTP para envio de e-mails.
   - `EMAIL_USER`: e-mail remetente para envio.
   - `REDIS_HOST` e `REDIS_PORT`: configuração do Redis.
   - `PORT`: porta para rodar a aplicação (opcional, padrão 3000).
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Execute as migrações do Prisma para criar as tabelas no banco:
   ```bash
   npx prisma migrate deploy
   ```
5. Inicie a aplicação:
   ```bash
   npm run start
   ```
6. A API estará disponível em `http://localhost:<PORT>`.

---

## Testes

O projeto possui testes unitários e de integração para os serviços principais, localizados na pasta `test/`. Utilize o comando:

```bash
npm run test
```

para executar os testes.

---

## Uploads

- Imagens de usuários são armazenadas na pasta `uploads/`.
- Imagens de hotéis são armazenadas na pasta `uploads-hotel/`.
- Os arquivos são nomeados com UUID para evitar conflitos.

---

## Considerações Finais

Este projeto é uma API robusta para gerenciamento de reservas de hotéis, utilizando tecnologias modernas e boas práticas de desenvolvimento backend com NestJS. A arquitetura modular facilita a manutenção e escalabilidade do sistema.
