# Features

## RF (Requisitor Funcionais)

### Subdomain Identity

- [x] O usuário deve poder se registrar;
- [x] O usuário deve poder se autenticar;
- [x] O usuário deve poder acessar seu perfil;

### Subdomain Bookings (Core)

- [ ] O usuário deve poder reservar uma quadra por um tempo determinado;
- [ ] O usuário deve poder listar todas suas últimas reservas;
- [ ] Deve ser possível cancelar uma reserva depois de confirmada;
- [ ] Deve ser possível cadastrar uma quadra;
- [ ] O usuário deve poder listar quadras próximas a ele (Até 10km) (ativas);
- [ ] O usuário deve poder pesquisar quadras por endereço (ativas);
- [ ] O usuário deve poder pesquisar quadras pelo tipo de esporte na descrição (ativas);
- [ ] Deve ser possível desativar uma quadra sem previsão de retorno;
- [ ] Deve ser possível reativar uma quadra;
- [ ] Deve ser possível restringir horários de uso das quadras;

## RN

- [x] Não pode haver dois usuários com o mesmo email;
- [x] A reserva só pode ser realizada se a quadra e o horário de reserva estiverem disponíveis;
- [x] A reserva não pode ser realizada em horários restritos da quadra;
- [x] O usuário não pode fazer mais do que 1 reserva por dia;
- [x] A reserva deve ser feita com no mínimo 2 horas de antecedencia;
- [x] O usuário não pode reservar uma quadra por mais de 6 horas;
- [x] Para a reserva ser confirmada deve haver o pagamento em até 20 minutos (via pix ou cartão);
- [ ] Se a reserva for cancelada o valor deve ser reembolsado;
- [x] A reserva só pode ser cancelada com no mínimo 2 horas de antecedencia;
- [x] As quadras só podem ser cadastradas por administradores;

## RNFs (Requisitos não funcionais)

- [x] A senha do usuário deve estar criptografada;
- [x] Os dados da aplicação devem ser persistidos em um banco PostgreSQL;
- [x] Todos os dados da aplicação devem ser paginados em até 20 items;
- [x] O usuário deve ser identificado por um JWT (JSON Web Token);