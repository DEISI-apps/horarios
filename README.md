# App Horários

App em produção em: https://horarios-phi.vercel.app/

Como trabalhar em modo de desenvolvimento:
1. abrir em codespaces
1. `nvm install 20`
1. `nvm use 20`
1. `npm install`
2. `npm run dev` para testar funcionamento no browser em  [http://localhost:3000](http://localhost:3000).
3. fazer alterações
4. `npm run build` para verificar se está tudo ok
5. git add, commit e push para sincronizar no repo
6. ver em produção, a correr em `https://horarios-phi.vercel.app/`

# Dados
* dados dos cursos, turmas, docentes e horarios de cada aula, veem da API https://dsdeisi.pythonanywhere.com/api/horarios/docs

* dados dos alunos vêm de: https://horariosdeisi.pythonanywhere.com.
    * Por exemplo https://horariosdeisi.pythonanywhere.com/aluno-turmas/${numero} retorna as turmas de cada disciplina inscrito.

# Info extra
em `DisciplinasCard` há info sobre docentes que podemos adicionar

# variaveis ambiente
no vercel eexistem variaveis de ambiente. poisso importar com:
* npx vercel login
* npx vercel link
* npx vercel env pull .env.local
* npm run dev

# Docentes autorizados a autenticar-se
* existe uma variável de ambiente no Vercel, com a lista de emails de docentes
* formato da variável:

p5502@ulusofona.pt,p1644@ulusofona.pt,p6476@ulusofona.pt,carlaalexmartins@gmail.com,p1059@ulusofona.pt,p1135@ulusofona.pt,p6265@ulusofona.pt,p4854@ulusofona.pt,p6137@ulusofona.pt,p7582@ulusofona.pt,p6419@ulusofona.pt,p8344@ulusofona.pt,p8346@ulusofona.pt,p7392@ulusofona.pt,p6852@ulusofona.pt,p5932@ulusofona.pt,p5403@ulusofona.pt,p5653@ulusofona.pt,p7559@ulusofona.pt,p8602@ulusofona.pt,p5958@ulusofona.pt,p5752@ulusofona.pt,p5265@ulusofona.pt,p8080@ulusofona.pt,p8980@ulusofona.pt,p6069@ulusofona.pt,p6183@ulusofona.pt,p252@ulusofona.pt,p6255@ulusofona.pt,p8094@ulusofona.pt,p5413@ulusofona.pt,p4693@ulusofona.pt,p3603@ulusofona.pt,p5617@ulusofona.pt,p7530@ulusofona.pt,p4997@ulusofona.pt,p6115@ulusofona.pt,p8978@ulusofona.pt,p7348@ulusofona.pt,p6949@ulusofona.pt,p40525@ulusofona.pt,p6779@ulusofona.pt,p3715@ulusofona.pt,p2211@ulusofona.pt,p6221@ulusofona.pt,p8375@ulusofona.pt,p2703@ulusofona.pt,p513@ulusofona.pt,p5258@ulusofona.pt,p6902@ulusofona.pt,p6951@ulusofona.pt,p6062@ulusofona.pt,p8133@ulusofona.pt,p597@ulusofona.pt,augusto.pt@gmail.com,jose.carlos.pratas@cgi.com,p8029@ulusofona.pt,p8400@ulusofona.pt,p3113@ulusofona.pt,p8654@ulusofona.pt

* incuir nao profs, para acederem e verem a plataforma:
mjdamasio@ulusofona.pt,p695@ulusofona.pt,p1837@ulusofona.pt,p967@ulusofona.pt,paulo.ferreira@ulusofona.pt,timoteo.rodrigues@ulusofona.pt,p3418@ulusofona.pt,f3418@ulusofona.pt,f3090@ulusofona.pt,f4849@ulusofona.pt,f3090@ulusofona.pt,f3560@ulusofona.pt,p718@ulusofona.pt,f3560@ulusofona.pt

# Disciplinas

# Como carregar novo semestre?
1. atualizar dsd em https://dsdeisi.pythonanywhere.com/
2. na consola da aplicação dsdeisi, copiar de um anolectivo & semestre para outro com o comando:
```
python manage.py copiar_horarios \
    --ano_lectivo_origem=26-27 \
    --semestre_origem=1 \
    --ano_lectivo_destino=26-27 \
    --semestre_destino=2
```

3. alterar em `lib/constants.ts` os valores de 

- ANO_LECTIVO
- ANO_LECTIVO_ID 
- SEMESTRE
- constantes para calendario icas 


4. criar horários em https://horarios-phi.vercel.app/editarHorarios

p5502@ulusofona.pt,p1644@ulusofona.pt,p6476@ulusofona.pt,carlaalexmartins@gmail.com,p1059@ulusofona.pt,p1135@ulusofona.pt,p6265@ulusofona.pt,p4854@ulusofona.pt,p6137@ulusofona.pt,p7582@ulusofona.pt,p6419@ulusofona.pt,p8344@ulusofona.pt,p8346@ulusofona.pt,p7392@ulusofona.pt,p6852@ulusofona.pt,p5932@ulusofona.pt,p5403@ulusofona.pt,p5653@ulusofona.pt,p7559@ulusofona.pt,p8602@ulusofona.pt,p5958@ulusofona.pt,p5752@ulusofona.pt,p5265@ulusofona.pt,p8080@ulusofona.pt,p8980@ulusofona.pt,p6069@ulusofona.pt,p6183@ulusofona.pt,p252@ulusofona.pt,p6255@ulusofona.pt,p8094@ulusofona.pt,p5413@ulusofona.pt,p4693@ulusofona.pt,p3603@ulusofona.pt,p5617@ulusofona.pt,p7530@ulusofona.pt,p4997@ulusofona.pt,p6115@ulusofona.pt,p8978@ulusofona.pt,p7348@ulusofona.pt,p6949@ulusofona.pt,p40525@ulusofona.pt,p6779@ulusofona.pt,p3715@ulusofona.pt,p2211@ulusofona.pt,p6221@ulusofona.pt,p8375@ulusofona.pt,p2703@ulusofona.pt,p513@ulusofona.pt,p5258@ulusofona.pt,p6902@ulusofona.pt,p6951@ulusofona.pt,p6062@ulusofona.pt,p8133@ulusofona.pt,p597@ulusofona.pt,augusto.pt@gmail.com,jose.carlos.pratas@cgi.com,p8029@ulusofona.pt,p8400@ulusofona.pt,p3113@ulusofona.pt,p8654@ulusofona.pt,mjdamasio@ulusofona.pt,p695@ulusofona.pt,p1837@ulusofona.pt,p967@ulusofona.pt,paulo.ferreira@ulusofona.pt,timoteo.rodrigues@ulusofona.pt,p3418@ulusofona.pt,f3418@ulusofona.pt,f3090@ulusofona.pt,f4849@ulusofona.pt,f3090@ulusofona.pt,f3560@ulusofona.pt,p718@ulusofona.pt,f3560@ulusofona.pt