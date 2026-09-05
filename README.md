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

