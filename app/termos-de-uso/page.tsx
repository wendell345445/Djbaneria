import { LegalPageShell } from "@/components/legal-page-shell";

const company = {
  name: "DJ Pro IA / DJ Banner AI",
  cnpj: "46.389.053/0001-47",
  email: "uendellalonso2013@gmail.com",
  domain: "https://djproia.com",
};

export const metadata = {
  title: "Termos de Uso | DJ Pro IA",
  description: "Termos de Uso da plataforma DJ Pro IA.",
};

export default function TermsOfUsePage() {
  return (
    <LegalPageShell
      eyebrow="Termos legais"
      title="Termos de Uso"
      description="Leia as regras para acessar e utilizar a plataforma DJ Pro IA, incluindo geração de banners com IA, créditos, assinaturas e responsabilidades do usuário."
      lastUpdated="27 de abril de 2026"
    >
      <h2>1. Identificação da plataforma</h2>
      <p>
        Estes Termos de Uso regulam o acesso e uso da plataforma <strong>{company.name}</strong>, disponível em <strong>{company.domain}</strong>, um software online para criação de banners, artes promocionais e materiais visuais com auxílio de inteligência artificial, voltado principalmente para DJs, produtores musicais, eventos, casas noturnas e divulgação digital.
      </p>
      <p>
        <strong>Responsável pela plataforma:</strong> {company.name}<br />
        <strong>CNPJ:</strong> {company.cnpj}<br />
        <strong>E-mail de contato:</strong> {company.email}
      </p>
      <p>
        Ao criar uma conta, acessar, contratar ou utilizar a plataforma, o usuário declara que leu, entendeu e concorda com estes Termos.
      </p>

      <h2>2. Definições</h2>
      <ul>
        <li><strong>Usuário:</strong> pessoa física ou jurídica que acessa ou utiliza a plataforma.</li>
        <li><strong>Conta:</strong> cadastro criado pelo usuário para acessar o painel e os recursos da plataforma.</li>
        <li><strong>Workspace:</strong> ambiente associado à conta do usuário, onde são armazenados banners, histórico, créditos, assinatura e configurações.</li>
        <li><strong>Créditos:</strong> unidades de uso que permitem gerar, editar ou solicitar variações de banners com IA.</li>
        <li><strong>Banner:</strong> imagem, arte ou peça visual gerada, editada ou baixada pela plataforma.</li>
        <li><strong>IA:</strong> tecnologias de inteligência artificial e modelos externos utilizados para criação ou edição de imagens.</li>
        <li><strong>Plano:</strong> modalidade Free, Pro, Professional ou Studio, com limites e benefícios próprios.</li>
        <li><strong>Serviços terceiros:</strong> ferramentas integradas, como Stripe, provedores de IA, Vercel, Neon, Resend, Cloudflare, Meta e outros provedores necessários ao funcionamento da plataforma.</li>
      </ul>

      <h2>3. Elegibilidade e criação de conta</h2>
      <p>O usuário declara que:</p>
      <ol>
        <li>tem pelo menos 18 anos ou idade legal para contratar serviços digitais em sua jurisdição;</li>
        <li>fornece informações verdadeiras, completas e atualizadas;</li>
        <li>não criará contas falsas, automatizadas, fraudulentas ou destinadas a burlar limites gratuitos;</li>
        <li>manterá suas credenciais de acesso em segurança;</li>
        <li>será responsável por qualquer atividade realizada em sua conta.</li>
      </ol>
      <p>
        Podemos suspender, limitar ou encerrar contas com indícios de abuso, fraude, violação destes Termos, uso de e-mails temporários, múltiplas contas para burlar créditos, automação indevida ou atividade incompatível com a finalidade da plataforma.
      </p>

      <h2>4. Verificação de e-mail e proteção contra abuso</h2>
      <p>
        A plataforma pode exigir confirmação de e-mail por código antes de liberar recursos, incluindo geração de banners. Também podemos usar mecanismos de segurança como Cloudflare Turnstile, bloqueio de e-mails temporários, validação de origem da requisição, limites de uso, análise de IP, logs técnicos e monitoramento de atividades suspeitas.
      </p>
      <p>
        O usuário concorda que essas medidas são necessárias para proteger créditos gratuitos, evitar fraude, reduzir abuso e preservar a estabilidade do serviço.
      </p>

      <h2>5. Serviços oferecidos</h2>
      <p>A plataforma pode permitir, entre outras funcionalidades:</p>
      <ul>
        <li>geração de banners com IA;</li>
        <li>envio de imagem de referência do DJ, artista ou evento;</li>
        <li>escolha de estilo visual, formato e qualidade;</li>
        <li>edição ou variação de banners mediante consumo de créditos;</li>
        <li>download de banners gerados;</li>
        <li>gerenciamento de plano e assinatura;</li>
        <li>configuração de idioma;</li>
        <li>acesso ao histórico de banners.</li>
      </ul>
      <p>
        As funcionalidades podem ser alteradas, removidas, substituídas ou aprimoradas a qualquer momento por razões técnicas, comerciais, regulatórias ou operacionais.
      </p>

      <h2>6. Créditos, limites e planos</h2>
      <p>
        A plataforma utiliza sistema de créditos. Cada geração, alteração ou variação pode consumir créditos conforme indicado no painel. Os limites e benefícios podem variar conforme o plano contratado.
      </p>
      <p>Os créditos podem estar sujeitos a:</p>
      <ol>
        <li>validade por ciclo mensal;</li>
        <li>renovação condicionada à confirmação do pagamento;</li>
        <li>regras específicas de upgrade ou troca de plano;</li>
        <li>consumo por geração, edição ou variação;</li>
        <li>não conversão em dinheiro;</li>
        <li>não transferência entre contas, salvo autorização expressa.</li>
      </ol>
      <p>
        A plataforma pode alterar preços, limites, planos e benefícios, respeitando contratos vigentes e regras aplicáveis quando houver obrigação legal de comunicação.
      </p>

      <h2>7. Assinaturas, pagamentos e Stripe</h2>
      <p>
        Pagamentos e assinaturas são processados por provedores terceiros, especialmente a Stripe. A plataforma não armazena dados completos de cartão de crédito.
      </p>
      <p>Ao contratar um plano pago, o usuário concorda que:</p>
      <ol>
        <li>a cobrança poderá ser recorrente;</li>
        <li>a renovação dependerá do sucesso do pagamento;</li>
        <li>falhas de pagamento podem limitar ou suspender créditos pagos;</li>
        <li>upgrades, downgrades ou trocas podem gerar cobranças conforme informado no checkout;</li>
        <li>cancelamentos podem ser processados pelo portal de assinatura ou canais indicados;</li>
        <li>tributos, taxas e encargos podem variar conforme localização e meio de pagamento.</li>
      </ol>
      <p>O usuário é responsável por manter dados de pagamento atualizados.</p>

      <h2>8. Cancelamento, reembolso e arrependimento</h2>
      <p>
        O usuário pode cancelar a assinatura conforme opções disponíveis no painel ou portal de pagamento. Salvo quando exigido por lei ou expressamente informado, valores pagos por planos digitais, créditos já utilizados, períodos parcialmente consumidos ou serviços já disponibilizados podem não ser reembolsáveis.
      </p>
      <p>
        Quando aplicável, direitos legais de arrependimento, reembolso ou contestação serão analisados conforme a legislação vigente, natureza do serviço e uso efetivo dos recursos. Solicitações devem ser enviadas para <strong>{company.email}</strong>.
      </p>

      <h2>9. Uso permitido</h2>
      <p>O usuário pode usar a plataforma para criar banners e materiais visuais destinados a divulgação de eventos, posts em redes sociais, agenda de shows, campanhas de tráfego pago, comunicação profissional e materiais promocionais lícitos.</p>

      <h2>10. Uso proibido</h2>
      <p>É proibido usar a plataforma para:</p>
      <ul>
        <li>violar direitos autorais, marcas, imagem, voz, nome ou reputação de terceiros;</li>
        <li>enviar foto de pessoa sem autorização quando exigida;</li>
        <li>criar conteúdo enganoso, fraudulento, difamatório, discriminatório, ilegal ou que viole direitos de terceiros;</li>
        <li>simular endossos, parcerias, marcas, artistas ou eventos inexistentes;</li>
        <li>burlar limites de créditos, pagamentos, verificações, segurança ou regras da plataforma;</li>
        <li>usar automações, bots, scraping, engenharia reversa ou ataques à infraestrutura;</li>
        <li>comercializar, revender ou sublicenciar acesso sem autorização;</li>
        <li>usar o serviço para spam, golpe, phishing, malware, atividades ilícitas ou manipulação de anúncios.</li>
      </ul>

      <h2>11. Imagens enviadas e responsabilidade do usuário</h2>
      <p>
        Ao enviar fotos, imagens, marcas, nomes artísticos, textos, datas, locais ou qualquer material, o usuário declara possuir direitos, licenças, autorizações ou base legal para uso desses elementos.
      </p>
      <p>
        O usuário é o único responsável por obter autorizações de pessoas retratadas, titulares de marcas, fotógrafos, designers, produtoras, casas de evento, agências, artistas, gravadoras ou terceiros relacionados ao material enviado.
      </p>

      <h2>12. Conteúdo gerado por inteligência artificial</h2>
      <p>
        A plataforma utiliza IA para gerar e editar imagens. Resultados gerados por IA podem conter imperfeições, erros visuais, variações inesperadas, semelhanças não intencionais com estilos, elementos ou obras existentes, ou resultados diferentes do pedido original.
      </p>
      <p>
        Não garantimos exclusividade absoluta, originalidade jurídica plena, adequação publicitária, ausência de semelhança com obras de terceiros ou aprovação de plataformas de anúncios. O usuário deve revisar cada banner antes de publicar, vender, impulsionar ou usar comercialmente.
      </p>

      <h2>13. Direitos sobre os banners</h2>
      <p>
        Dentro dos limites permitidos por lei, pelos provedores de IA e por estes Termos, o usuário pode usar os banners gerados para seus próprios fins promocionais e comerciais. Esse direito não abrange materiais de terceiros inseridos sem autorização pelo usuário.
      </p>
      <p>
        Podemos usar imagens geradas de forma agregada, anonimizada ou mediante autorização para demonstrar funcionalidades, melhorar o serviço ou promover a plataforma, respeitando a Política de Privacidade e configurações aplicáveis.
      </p>

      <h2>14. Disponibilidade e alterações do serviço</h2>
      <p>
        A plataforma pode sofrer indisponibilidades temporárias por manutenção, falhas de terceiros, limitações de infraestrutura, alterações em APIs, indisponibilidade de provedores de IA, incidentes de rede ou motivos de força maior.
      </p>
      <p>
        Não garantimos funcionamento ininterrupto, ausência total de erros, compatibilidade com todos os dispositivos, navegadores ou usos específicos.
      </p>

      <h2>15. Serviços terceiros</h2>
      <p>
        A plataforma depende de serviços terceiros como Stripe, provedores de IA, Vercel, Neon, Resend, Cloudflare, Meta e outros. O usuário reconhece que falhas, alterações, bloqueios, limites ou indisponibilidades desses terceiros podem afetar a plataforma.
      </p>
      <p>
        O uso de serviços terceiros pode estar sujeito aos respectivos termos e políticas de privacidade.
      </p>

      <h2>16. Campanhas, Pixel, CAPI e rastreamento</h2>
      <p>
        A plataforma pode usar Meta Pixel, Conversions API, cookies, identificadores de navegador e eventos de conversão para medir visitas, cadastros, início de checkout, compras, assinaturas e performance de campanhas. O uso dessas tecnologias é descrito na Política de Privacidade.
      </p>

      <h2>17. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei, a plataforma não será responsável por perdas indiretas, lucros cessantes, danos reputacionais, rejeição de anúncios, bloqueio de contas em redes sociais, uso indevido de imagem, violações cometidas pelo usuário, falhas de terceiros, indisponibilidade temporária, resultados insatisfatórios de IA ou decisões comerciais tomadas com base nos banners.
      </p>
      <p>
        Nossa responsabilidade total, quando legalmente aplicável, ficará limitada ao valor pago pelo usuário à plataforma nos 3 meses anteriores ao evento que originou a reclamação, salvo disposição legal obrigatória em sentido contrário.
      </p>

      <h2>18. Suspensão e encerramento</h2>
      <p>
        Podemos suspender, limitar ou encerrar contas que violem estes Termos, apresentem risco de fraude, abuso, inadimplência, violação de direitos, uso indevido de IA, tentativa de burlar segurança ou descumprimento legal.
      </p>

      <h2>19. Comunicações</h2>
      <p>
        Podemos enviar comunicações operacionais, transacionais, de segurança, cobrança, suporte e atualizações relevantes por e-mail, painel, notificações internas ou outros meios informados pelo usuário.
      </p>

      <h2>20. Alterações destes Termos</h2>
      <p>
        Podemos atualizar estes Termos a qualquer momento. Alterações relevantes poderão ser comunicadas por meio da plataforma, e-mail ou publicação da nova versão. O uso contínuo da plataforma após a atualização significa concordância com os novos termos.
      </p>

      <h2>21. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pelas leis da República Federativa do Brasil. Salvo disposição legal obrigatória em contrário, fica eleito o foro competente do domicílio do responsável pela plataforma para solucionar controvérsias decorrentes destes Termos.
      </p>

      <h2>22. Contato</h2>
      <p>
        Para dúvidas, solicitações, suporte, questões jurídicas ou assuntos relacionados a estes Termos, entre em contato pelo e-mail: <strong>{company.email}</strong>.
      </p>
    </LegalPageShell>
  );
}
