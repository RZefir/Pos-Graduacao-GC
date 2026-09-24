## CI/CD

O projeto utiliza GitHub Actions para realizar o deploy automático das
funções no Google Cloud Run.

O pipeline tem dois triggers: Um manual para caso precise fazer o re-deploy da master, e outro que é quando alguma branch é mergeada com a master.

### Pipeline

1. Checkout do código
    A gente pega o código do repo. Aqui não precisa de token porque é o próprio github actions
2. Autenticação no Google Cloud
    Autentifica no google cloud usando o .json da service account
3. Configuração do Google Cloud CLI
    Configura a ferramenta de cli da gcloud no runner do github actions 
4. Deploy da Função 1
5. Deploy da Função 2
6. Deploy da Função 3

Os serviços são implantados nas respectivas regiões configuradas no projeto. Eu errei uma região, então acabou ficando.

### Evidência

O pipeline foi executado com sucesso no GitHub Actions, realizando o build
e deploy das três funções no Google Cloud Run.