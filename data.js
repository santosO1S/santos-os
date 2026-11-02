'use strict';
/* ============================================================
   SANTOS HACKER SIMULATOR 0.3 — DADOS ESTÁTICOS
   Para expandir o jogo, edite apenas este arquivo:
   locais (PLACES), NPCs, itens (ITEMS), missões (MIS), habilidades e conquistas.
   Tudo é FICTÍCIO e offline.
   ============================================================ */
const RANKS=['Trainee','Iniciante','Analista','Operador','Especialista','Veterano','Elite','Mestre','Lenda'];
const REPT=[[0,'Desconhecido'],[30,'Notado'],[100,'Respeitado'],[250,'Renomado'],[500,'Lendário']];
const TYPES=['logs','logic','audit','vuln','defense','invest'];
const TYPEN={logs:'Análise de Logs',logic:'Quebra-cabeça Lógico',audit:'Auditoria de Segurança',vuln:'Revisão de Vulnerabilidades',defense:'Defesa contra Ataques',invest:'Investigação Digital'};
const TYPESTAT={logs:'ssd',logic:'ram',audit:'net',vuln:'cpu',defense:'cpu',invest:'ram'};

/* ---------- LOCAIS ---------- */
const PLACES=[
{id:'apt',name:'Apartamento do Jogador',short:'CASA',desc:'Seu PC e seus contratos',lvl:1,x:48,y:205,kw:['apartamento','casa','home'],
 intro:'Um apartamento pequeno: cabos pelo chão, dois monitores e café frio. É o seu quartel-general.',
 scan:['HOME-PC [SIMULADO] • ROTEADOR-CASA [SIMULADO]'],
 files:{'bem-vindo.txt':'SEU APARTAMENTO. Aqui ficam seu computador e seus contratos.\nRoteiro: abra CONTRATOS, aceite um trabalho, ganhe créditos, melhore o PC na LOJA (Mercado Virtual) e suba de nível.\nFale com Mira no laboratório (connect lab).','dicas.txt':'• Hardware melhor ajuda nos contratos difíceis (veja o app MEU PC).\n• Salve/exporte seu progresso em CONFIG.\n• Digite help no terminal a qualquer momento.'},
 ex:[['Debaixo do sofá, uma carteira antiga com créditos fictícios.',30,40],['Na gaveta do monitor há um pendrive com anotações.',40,20,'pendrive']],
 acts:[['Abrir Contratos','app:con'],['Melhorar o PC','app:pc'],['Descansar e salvar','rest']]},
{id:'lab',name:'Laboratório Hacker (Treinamento)',short:'LAB',desc:'Desafios básicos',lvl:1,x:95,y:150,kw:['laboratorio','treinamento','hacker'],
 intro:'Bancadas, servidores de teste e um quadro cheio de anotações.',
 scan:['LAB-TRAINING [SIMULADO] • LOG-ARCHIVE [SIMULADO]'],
 files:{'readme.txt':'Bem-vindo, trainee. Roteiro: scan → logs → decrypt <código>. Depois visite o Mercado Virtual (connect market).','notas.txt':'Lembrete: o Mercado Virtual vende ferramentas. Missões maiores esperam na Corporação Aurora e no Data Center Ônix.'},
 ex:[['Você encontra um pendrive de testes esquecido sob a bancada.',40,30,'pendrive'],['Atrás do quadro há um cofre de treino com créditos fictícios.',60,50]],
 acts:[['Treino de lógica','practice:logic'],['Treino de análise de logs','practice:logs']]},
{id:'corp',name:'Corporação Aurora',short:'AURORA',desc:'Análise de logs fictícios',lvl:2,x:255,y:55,kw:['aurora','corporacao'],
 intro:'Torre corporativa fictícia. A rede interna parece barulhenta demais.',
 scan:['AURORA-GW [SIMULADO] • AURORA-HR [SIMULADO] • AURORA-MAIL [SIMULADO]'],
 files:{'memo.txt':'MEMO AURORA: auditoria interna pendente — rode "audit". Há tráfego estranho na rede; um sniffer ajudaria a capturar pacotes.','equipe.txt':'Equipe de TI: 4 pessoas fictícias, 1 cafeteira, 0 backups.'},
 ex:[['Uma senha de Wi-Fi fictícia colada num monitor: "aurora123".',50,40],['Na lixeira digital: relatório descartado com bônus fictício.',70,60,'cartao']],
 acts:[['Treino de auditoria','practice:audit']]},
{id:'data',name:'Data Center Ônix',short:'ÔNIX',desc:'Quebra-cabeças e defesa',lvl:3,x:275,y:175,kw:['onix','datacenter','data center'],
 intro:'Corredores frios, racks zumbindo e luzes verdes piscando.',
 scan:['ONIX-RACK-A [SIMULADO] • ONIX-RACK-B [SIMULADO]'],
 files:{'rack_a.log':'RACK-A temp 41C. Setor 7 contém COFRE-ONIX. Use "scan deep" para localizá-lo.','cofre.txt':'COFRE SELADO. Senha = código capturado no tráfego da Aurora (formato NOME-N). Use: unlock <senha>.'},
 ex:[['Uma ventoinha solta guarda um chip com créditos fictícios.',80,70,'chip'],['Um painel de manutenção revela um atalho de logs.',100,90]],
 acts:[['Simulador de defesa','practice:defense']]},
{id:'market',name:'Mercado Virtual',short:'MERCADO',desc:'Ferramentas e peças',lvl:2,x:130,y:62,kw:['mercado','loja','ferramentas'],
 intro:'Barracas holográficas vendem ferramentas virtuais. Digite shop.',
 scan:['MARKET-STALL-01 [SIMULADO] • MARKET-STALL-02 [SIMULADO]'],
 files:{'catalogo.txt':'Digite "shop" para ver os itens e "buy <id>" para comprar. Ferramentas liberam novos comandos. Peças de hardware melhoram seu PC. Itens achados podem ser vendidos com "sell all".'},
 ex:[['Um vendedor deixa cair um cupom virtual. Boa!',40,60,'cupom'],['Você descobre uma barraca secreta que paga por informação.',60,80]],
 acts:[['Abrir Loja','app:shop'],['Vender itens achados','sell']]},
{id:'tech',name:'Centro Tecnológico Meridiano',short:'MERIDIANO',desc:'Pesquisa e melhorias',lvl:4,x:190,y:125,kw:['tecnologico','meridiano','centro','tech'],
 intro:'Um campus de vidro e neon. Pesquisadores discutem defesa de redes ao lado de máquinas de café.',
 scan:['MERIDIANO-LAB [SIMULADO] • MERIDIANO-WIFI [SIMULADO]'],
 files:{'pesquisa.txt':'MERIDIANO: pesquisa em defesa de redes. Hardware melhor aumenta o tempo de resposta e libera ferramentas de análise nos contratos difíceis.','agenda.txt':'Palestra: "Por que logs salvam empresas". Sala 3.'},
 ex:[['Em uma bancada há uma placa de protótipo esquecida.',120,100,'placa'],['Um quadro branco mostra um diagrama de rede com anotações úteis.',140,120]],
 acts:[['Laboratório de falhas (revisão de código)','practice:vuln'],['Abrir Loja','app:shop'],['Meu PC','app:pc']]},
{id:'under',name:'Rede Subterrânea',short:'RAÍZES',desc:'Informantes e segredos',lvl:5,rep:50,x:165,y:208,kw:['subterranea','raizes','rede subterranea','under'],
 intro:'Túneis de fibra, grafites luminosos e um zumbido grave. Aqui circula informação que ninguém publica.',
 scan:['RAIZES-NODE-1 [SIMULADO] • RAIZES-NODE-2 [SIMULADO]'],
 files:{'manifesto.txt':'RAÍZES: informação circula, dano não. Auditamos antes que os maus ajam.','eclipse.txt':'O grupo ECLIPSE segue um padrão: falhas de login em massa, depois um sucesso discreto. Se você viu isso nos logs da Aurora, já sabe quem está do outro lado. (fictício)'},
 ex:[['Entre cabos velhos, um drive etiquetado "RAÍZES".',180,150,'drive_raizes'],['Um mural de grafite esconde um código fictício.',200,180]],
 acts:[['Sala de evidências (investigação)','practice:invest']]}
];
const ROADS=[['apt','lab'],['lab','market'],['market','corp'],['corp','data'],['lab','tech'],['market','tech'],['corp','tech'],['tech','data'],['tech','under'],['under','apt'],['under','data']];

/* ---------- PERSONAGENS ---------- */
const NPCS=[
{id:'byte',n:'Byte',r:'Gato do apartamento',p:'apt',d:[[()=>!isDone('c1'),'Miau. (Byte encara o ícone de CONTRATOS, que parece piscar.)'],[()=>true,'Prrr... (Byte dorme sobre o teclado. Você sente que ele aprova.)']]},
{id:'mira',n:'Mira "Zero" Santos',r:'Mentora',p:'lab',d:[
 [()=>!isDone('c1'),'Ei, trainee. Sou a Mira, sua mentora. Regra número um: tudo aqui é simulação e a ética vem antes da técnica. Abra o app CONTRATOS no seu PC — já tem cliente esperando.'],
 [()=>!isDone('c2'),'Aceite um contrato e conclua. O dinheiro compra equipamento melhor, e equipamento melhor abre trabalhos maiores.'],
 [()=>!isDone('c3'),'A Aurora pediu ajuda: tráfego estranho na rede. Vá até lá (connect corp) e fale com a Dra. Helena.'],
 [()=>!isDone('c9'),'Esse tal grupo ECLIPSE não é amador. Continue subindo de nível e melhore o PC. Estou de olho nos seus relatórios.'],
 [()=>true,'Você virou referência por aqui, sabia? Quando o Eclipse voltar, estaremos prontos.']]},
{id:'caio',n:'Caio "Vector"',r:'Vendedor e informante',p:'market',d:[
 [()=>!has('sniffer')&&!has('decoder'),'Sou o Caio. Ferramentas virtuais, peças, tudo no balcão. Dica de amigo: o sniffer e o decodificador resolvem muita coisa na Aurora.'],
 [()=>level()<4,'Compro o que você achar por aí: use "sell all". E fique de olho no Centro Meridiano, eles têm peças melhores.'],
 [()=>true,'Os preços do Meridiano são honestos, mas aqui eu faço trade-in na sua peça antiga. Pensa nisso.']]},
{id:'helena',n:'Dra. Helena Vance',r:'CISO da Aurora',p:'corp',d:[
 [()=>!isDone('c3'),'Helena Vance, segurança da Aurora. Alguém acessou o RH de madrugada e uma notícia saiu antes da hora. Preciso de logs analisados — aceite um contrato de Análise de Logs.'],
 [()=>!isDone('c4'),'Os logs apontam para dentro de casa. Descubra quem vazou: um contrato de Investigação Digital resolve.'],
 [()=>!isDone('c9'),'Obrigada pelo trabalho. O Eclipse tem um padrão: falha, falha, falha… sucesso. Quero ver isso bloqueado no Ônix.'],
 [()=>true,'A Aurora tem uma vaga de analista para você, quando quiser. Sem pressão.']]},
{id:'rafa',n:'Rafael',r:'Estagiário de TI da Aurora',p:'corp',d:[[()=>true,'Eu só queria um café... Ah, o memo.txt tem pistas e o sniffer captura os pacotes. Ninguém me escuta aqui.']]},
{id:'tavares',n:'Tavares',r:'Sysadmin do Ônix',p:'data',d:[
 [()=>!isDone('c6'),'Tavares, sysadmin do Ônix. Os racks aguentam muita coisa, mas ataques coordenados exigem reação rápida. Seu processador faz diferença: mais CPU, mais tempo para reagir.'],
 [()=>true,'Aquele treino de defesa pagou. Meus racks agradecem.']]},
{id:'lidia',n:'Profa. Lídia Rocha',r:'Pesquisadora do Meridiano',p:'tech',d:[
 [()=>!isDone('c5'),'Lídia Rocha. Estudamos defesa de redes. Seu equipamento é seu limite: invista em peças e melhorias, cada ponto de atributo muda o que você consegue fazer.'],
 [()=>true,'Quando uma falha aparece em código, procure a linha — e entenda a correção, não só o erro.']]},
{id:'nyx',n:'Nyx',r:'Líder da Raízes',p:'under',d:[
 [()=>!isDone('c8'),'Você chegou até aqui, então Mira confia em você. A Raízes monitora o Eclipse há meses. Eles querem derrubar o Ônix e culpar a Aurora. Prove seu valor: resolva um quebra-cabeça lógico.'],
 [()=>!isDone('c9'),'Hora do golpe final: defenda o Ônix contra o ataque simulado do Eclipse e identifique o infiltrado na Aurora. Estamos com você.'],
 [()=>true,'O Eclipse perdeu o brilho. A Raízes agradece — e talvez precise de você outra vez.']]}
];

/* ---------- ITENS ---------- */
const STATS={cpu:['Processador','análise estática e tempo de reação na defesa'],ram:['Memória RAM','tentativas em lógica e comparação de evidências'],ssd:['SSD','filtro e destaque na análise de logs'],net:['Placa de rede','sondagens em auditorias']};
const pt=(slot,id,name,v,price,lvl)=>({kind:'part',slot,id,name,v,price,lvl,desc:STATS[slot][0]+' '+v+' — '+STATS[slot][1]});
const PARTS=[
pt('cpu','cpu1','Dual-Core Básico',1,0,1),pt('cpu','cpu2','Quad-Core Pulse',3,400,2),pt('cpu','cpu3','Hexa-Core Vortex',5,1100,3),pt('cpu','cpu4','Octa-Core Nebula',7,2600,5),pt('cpu','cpu5','Quantum-X Protótipo',10,6000,7),
pt('ram','ram1','8 GB DDR3',1,0,1),pt('ram','ram2','16 GB DDR4',3,350,2),pt('ram','ram3','32 GB DDR5',5,900,3),pt('ram','ram4','64 GB ECC',7,2200,5),pt('ram','ram5','128 GB ECC Quad',10,5200,7),
pt('ssd','ssd1','SSD SATA 256 GB',1,0,1),pt('ssd','ssd2','SSD SATA 512 GB',3,300,2),pt('ssd','ssd3','NVMe 1 TB',5,850,3),pt('ssd','ssd4','NVMe Gen4 2 TB',7,2000,5),pt('ssd','ssd5','Array NVMe RAID',10,4800,7),
pt('net','nic1','Placa Fast Ethernet',1,0,1),pt('net','nic2','Placa Gigabit',3,300,2),pt('net','nic3','Wi-Fi 6E',5,800,3),pt('net','nic4','Fibra 10G',7,1900,5),pt('net','nic5','Fibra 40G',10,4500,7)
];
const pcm=(id,name,p,l,c,r,s,n)=>({kind:'pc',id,name,price:p,lvl:l,parts:{cpu:c,ram:r,ssd:s,net:n},desc:'Computador completo: '+[c,r,s,n].map(x=>PARTS.find(y=>y.id===x).name).join(' • ')});
const PCS=[
pcm('pc2','Desktop Trainee',1300,2,'cpu2','ram2','ssd2','nic2'),
pcm('pc3','Workstation Aurora',3500,3,'cpu3','ram3','ssd3','nic3'),
pcm('pc4','Servidor Ônix',8200,5,'cpu4','ram4','ssd4','nic4'),
pcm('pc5','Mainframe Eclipse',19000,7,'cpu5','ram5','ssd5','nic5')
];
const UPG={cpu:['Overclock Térmico',[300,650,1200]],ram:['Tuning de Memória',[250,550,1000]],ssd:['Cache de Disco',[250,550,1000]],net:['Roteamento Otimizado',[250,550,1000]]};
const UPS=[];Object.keys(UPG).forEach(k=>UPG[k][1].forEach((p,i)=>UPS.push({kind:'up',stat:k,tier:i+1,id:'up_'+k+(i+1),name:UPG[k][0]+' '+['I','II','III'][i],price:p,lvl:[2,3,5][i],desc:STATS[k][0]+' +1 (nível '+(i+1)+'/3) — '+STATS[k][1]})));
const TOOLS=[
{kind:'tool',id:'sniffer',name:'Sniffer de Pacotes',desc:'Libera o comando sniff (captura de tráfego simulado).',price:300,lvl:2},
{kind:'tool',id:'decoder',name:'Decodificador Base64',desc:'Libera o comando decode <texto>.',price:350,lvl:2},
{kind:'tool',id:'deepscan',name:'Scanner Profundo',desc:'Libera scan deep para achar alvos ocultos.',price:450,lvl:3},
{kind:'tool',id:'overclock',name:'Módulo Overclock',desc:'Passivo: +10% de XP nas recompensas de missões e contratos.',price:600,lvl:4},
{kind:'tool',id:'analyzer',name:'Analisador de Logs',desc:'Libera o filtro de texto na análise de logs dos contratos.',price:400,lvl:2},
{kind:'tool',id:'vpn',name:'VPN Fictícia',desc:'Passivo: +10% de pagamento nos contratos.',price:700,lvl:3},
{kind:'tool',id:'fwkit',name:'Kit Firewall',desc:'Passivo: absorve 1 dano nas simulações de defesa.',price:650,lvl:3},
{kind:'tool',id:'forensic',name:'Kit Forense',desc:'Passivo: libera o relatório forense extra nas investigações.',price:800,lvl:4}
];
const LOOT=[
{kind:'loot',id:'pendrive',name:'Pendrive de Testes',v:60,desc:'Cheio de arquivos antigos. Vale algo no Mercado.'},
{kind:'loot',id:'cartao',name:'Cartão de Acesso Antigo',v:90,desc:'Expirado, mas colecionável.'},
{kind:'loot',id:'chip',name:'Chip de Memória Fictício',v:140,desc:'Chip raro de rack.'},
{kind:'loot',id:'cupom',name:'Cupom Virtual',v:50,desc:'Cupom holográfico de barraca.'},
{kind:'loot',id:'placa',name:'Placa de Protótipo',v:220,desc:'Protótipo do Meridiano.'},
{kind:'loot',id:'drive_raizes',name:'Drive da Raízes',v:300,desc:'Armazenamento criptografado da Raízes.'}
];
const ITEMS=[...TOOLS,...PARTS,...PCS,...UPS,...LOOT];

/* ---------- MISSÕES ---------- */
/* obj: [flag, texto]. pre: missões que precisam estar concluídas. cat: t=treinamento, e=campanha Eclipse */
const MIS=[
{id:'m1',cat:'t',name:'Primeiro Acesso',desc:'Execute uma varredura simulada (scan).',xp:500,cash:250,rep:1,lvl:1,obj:[['scan','Executar scan']]},
{id:'m2',cat:'t',name:'Rastro no Log',desc:'Analise os registros fictícios com logs.',xp:350,cash:400,rep:1,lvl:1,obj:[['logs','Executar logs']]},
{id:'m3',cat:'t',name:'Código de Treinamento',desc:'Resolva o enigma com decrypt ORION.',xp:500,cash:600,rep:2,lvl:1,obj:[['decrypt','Resolver o enigma com decrypt']]},
{id:'m7',cat:'t',name:'Primeira Compra',desc:'Visite o Mercado Virtual e adquira uma ferramenta.',xp:300,cash:150,rep:2,lvl:2,obj:[['visit_market','Conectar ao Mercado Virtual'],['buy','Comprar uma ferramenta (buy)']]},
{id:'m4',cat:'t',name:'Auditoria Aurora',desc:'Investigue a Corporação Aurora.',xp:600,cash:500,rep:4,lvl:2,obj:[['visit_corp','Conectar à Corporação Aurora'],['memo','Ler memo.txt (cat memo.txt)'],['audit','Executar audit']]},
{id:'m5',cat:'t',name:'Tráfego Suspeito',desc:'Capture e decodifique o pacote misterioso da Aurora.',xp:800,cash:700,rep:5,lvl:2,obj:[['sniff','Capturar pacotes (sniff)'],['decode','Decodificar o pacote (decode)']]},
{id:'m6',cat:'t',name:'Cofre Ônix',desc:'Localize e abra o cofre do Data Center Ônix.',xp:1000,cash:900,rep:6,lvl:3,obj:[['visit_data','Conectar ao Data Center Ônix'],['deepscan','Localizar o cofre (scan deep)'],['unlock','Abrir o cofre (unlock)']]},
{id:'c1',cat:'e',name:'Cap. 1 — Boas-vindas',desc:'Conheça sua mentora e abra o app Contratos.',xp:200,cash:150,rep:3,lvl:1,obj:[['talk_mira','Falar com Mira no laboratório (talk mira)'],['open_con','Abrir o app Contratos']]},
{id:'c2',cat:'e',name:'Cap. 2 — Contrato de Estreia',desc:'Conclua seu primeiro contrato com sucesso.',xp:300,cash:200,rep:5,lvl:1,pre:['c1'],obj:[['contract_done','Concluir um contrato']]},
{id:'c3',cat:'e',name:'Cap. 3 — Alerta na Aurora',desc:'A Aurora detectou acessos estranhos. Ajude a Dra. Helena.',xp:500,cash:500,rep:8,lvl:2,pre:['c2'],obj:[['visit_corp','Conectar à Corporação Aurora'],['talk_helena','Falar com a Dra. Helena (talk helena)'],['read_news','Ler a notícia da Aurora no navegador'],['ch_logs','Concluir um contrato de Análise de Logs']]},
{id:'c4',cat:'e',name:'Cap. 4 — Quem Vazou?',desc:'Descubra o responsável pelo vazamento interno.',xp:700,cash:700,rep:10,lvl:3,pre:['c3'],obj:[['ch_invest','Concluir um contrato de Investigação'],['contracts3','Concluir 3 contratos no total']]},
{id:'c5',cat:'e',name:'Cap. 5 — Centro Meridiano',desc:'Evolua seu equipamento com a ajuda da Profa. Lídia.',xp:700,cash:800,rep:8,lvl:4,pre:['c4'],obj:[['visit_tech','Conectar ao Centro Tecnológico'],['talk_lidia','Falar com a Profa. Lídia (talk lidia)'],['upgrade','Melhorar o computador (peça, melhoria ou PC)']]},
{id:'c6',cat:'e',name:'Cap. 6 — Escudo do Ônix',desc:'Reforce a defesa do Data Center Ônix.',xp:900,cash:900,rep:12,lvl:4,pre:['c5'],obj:[['visit_data','Conectar ao Data Center Ônix'],['talk_tavares','Falar com Tavares (talk tavares)'],['ch_defense','Concluir um contrato de Defesa']]},
{id:'c7',cat:'e',name:'Cap. 7 — Código Frágil',desc:'Encontre falhas em código e auditorias.',xp:900,cash:1000,rep:12,lvl:5,pre:['c6'],obj:[['ch_vuln','Concluir um contrato de Revisão de Vulnerabilidades'],['ch_audit','Concluir um contrato de Auditoria']]},
{id:'c8',cat:'e',name:'Cap. 8 — Sinal Subterrâneo',desc:'Ganhe a confiança da Raízes.',xp:1000,cash:1200,rep:15,lvl:5,pre:['c7'],obj:[['visit_under','Conectar à Rede Subterrânea'],['talk_nyx','Falar com Nyx (talk nyx)'],['ch_logic','Concluir um contrato de Quebra-cabeça Lógico']]},
{id:'c9',cat:'e',name:'Cap. Final — Operação Eclipse',desc:'Pare o Eclipse: defenda o Ônix e exponha o infiltrado.',xp:2000,cash:3000,rep:30,lvl:6,pre:['c8'],obj:[['ch_defense3','Vencer um contrato de Defesa nível 3'],['ch_invest3','Resolver um contrato de Investigação nível 3'],['contracts10','Concluir 10 contratos no total']]}
];

/* ---------- HABILIDADES (1 ponto por nível ganho) ---------- */
const SKILLS=[
{id:'mentor',n:'Aprendizado Rápido',cost:1,lvl:2,d:'+10% de XP em tudo.'},
{id:'negotiator',n:'Negociador',cost:1,lvl:2,d:'+10% de pagamento nos contratos e vendas.'},
{id:'analyst',n:'Olho Clínico',cost:2,lvl:3,d:'Libera filtro e resumo de falhas na análise de logs.'},
{id:'logician',n:'Mente Lógica',cost:2,lvl:3,d:'+2 tentativas nos quebra-cabeças.'},
{id:'auditor',n:'Auditor Meticuloso',cost:2,lvl:4,d:'+2 sondagens nas auditorias.'},
{id:'coder',n:'Revisor de Código',cost:2,lvl:4,d:'+2 análises estáticas na revisão de código.'},
{id:'hardener',n:'Defesa em Profundidade',cost:2,lvl:4,d:'+2 escudos nas simulações de defesa.'},
{id:'forensics',n:'Perícia Digital',cost:3,lvl:5,d:'Relatório forense extra e comparação automática nas investigações.'},
{id:'ghost',n:'Presença Fantasma',cost:3,lvl:6,d:'+15% de reputação ganha.'}
];

/* ---------- CONQUISTAS (+50 XP cada) ---------- */
const ACH=[
{id:'a_first',n:'Primeiro Contrato',d:'Conclua um contrato.',t:()=>s.stats.contracts>=1},
{id:'a_c10',n:'Freelancer Veterano',d:'Conclua 10 contratos.',t:()=>s.stats.contracts>=10},
{id:'a_c25',n:'Máquina de Contratos',d:'Conclua 25 contratos.',t:()=>s.stats.contracts>=25},
{id:'a_logs',n:'Analista de Logs',d:'Conclua um contrato de logs.',t:()=>s.stats.ch.logs>=1},
{id:'a_logic',n:'Mente Brilhante',d:'Conclua um quebra-cabeça lógico.',t:()=>s.stats.ch.logic>=1},
{id:'a_audit',n:'Auditor',d:'Conclua uma auditoria.',t:()=>s.stats.ch.audit>=1},
{id:'a_vuln',n:'Caçador de Falhas',d:'Conclua uma revisão de vulnerabilidades.',t:()=>s.stats.ch.vuln>=1},
{id:'a_def',n:'Muralha',d:'Conclua uma defesa.',t:()=>s.stats.ch.defense>=1},
{id:'a_inv',n:'Detetive Digital',d:'Conclua uma investigação.',t:()=>s.stats.ch.invest>=1},
{id:'a_all',n:'Faz-Tudo',d:'Conclua todos os 6 tipos de contrato.',t:()=>TYPES.every(t=>s.stats.ch[t]>=1)},
{id:'a_perfect',n:'Perfeição',d:'Termine um desafio com nota máxima.',t:()=>s.stats.perfect>=1},
{id:'a_flaw',n:'Defesa Impecável',d:'Defenda sem sofrer dano.',t:()=>s.stats.flawless>=1},
{id:'a_lv5',n:'Nível 5',d:'Alcance o nível 5.',t:()=>level()>=5},
{id:'a_lv10',n:'Nível 10',d:'Alcance o nível 10.',t:()=>level()>=10},
{id:'a_explore',n:'Explorador',d:'Visite os 7 locais.',t:()=>PLACES.every(p=>s.visited.includes(p.id))},
{id:'a_upg',n:'Upgrade!',d:'Instale uma peça melhor no PC.',t:()=>['cpu','ram','ssd','net'].some(k=>ITEM[s.pc[k]].v>1)},
{id:'a_war',n:'Máquina de Guerra',d:'Todas as peças com atributo 7 ou mais.',t:()=>['cpu','ram','ssd','net'].every(k=>ITEM[s.pc[k]].v>=7)},
{id:'a_cash',n:'Bolso Cheio',d:'Tenha $2000 de uma vez.',t:()=>s.cash>=2000},
{id:'a_rich',n:'Magnata',d:'Ganhe $10000 no total.',t:()=>s.stats.earned>=10000},
{id:'a_rep',n:'Respeitado',d:'Alcance 100 de reputação.',t:()=>s.rep>=100},
{id:'a_skill',n:'Especialista',d:'Aprenda 4 habilidades.',t:()=>s.skills.length>=4},
{id:'a_sell',n:'Comerciante',d:'Venda um item achado.',t:()=>s.stats.sold>=1},
{id:'a_prol',n:'Prólogo Concluído',d:'Conclua todas as missões de treinamento.',t:()=>MIS.filter(m=>m.cat==='t').every(m=>isDone(m.id))},
{id:'a_camp',n:'Fim do Eclipse',d:'Conclua a campanha.',t:()=>isDone('c9')},
{id:'a_save',n:'Backup Feito',d:'Exporte seu progresso.',t:()=>s.stats.exports>=1},
{id:'a_gold',n:'Liga Ouro',d:'Alcance a liga Ouro no ranking.',t:()=>tierOf(score()).li>=2},
{id:'a_legend',n:'Lenda do Ranking',d:'Alcance a liga Lenda.',t:()=>tierOf(score()).li>=6}
];

/* ---------- RANKING (rivais fictícios, local) ---------- */
const RIVALS=[['Vx_Ghost',24800],['Kira.exe',19200],['NullPointer',15100],['Eclipse//0',12400],['Marta_Root',9800],['Dr.Packet',7600],['ByteWitch',5400],['Lin_Zero',3600],['nubzin',1500],['Padawan42',700]];

/* ---------- CONTRATOS ---------- */
const DREW=[null,{cash:150,xp:120,rep:1},{cash:400,xp:260,rep:2},{cash:900,xp:520,rep:4}];
const TMUL={logs:1,logic:.9,audit:1.1,vuln:1.15,defense:1.3,invest:1.2};
const CLIENTS={logs:['Corporação Aurora','Data Center Ônix','Centro Meridiano','Hospital Fictício Vita','Banco Fictício Crédix','Transportadora Fictícia Rota'],logic:['Cofre de Testes Ônix','Centro Meridiano','Laboratório Hacker','Escola Fictícia Nova Era','Startup Fictícia Nimbus'],audit:['Corporação Aurora','Mercado Virtual','Data Center Ônix','Prefeitura Fictícia de Vila Azul','Cooperativa Fictícia Campo Verde'],vuln:['Centro Meridiano','Startup Fictícia Nimbus','Corporação Aurora','Jogo Fictício Pixelar','App Fictício Ondas'],defense:['Data Center Ônix','Corporação Aurora','Rede Raízes','Aeroporto Fictício Horizonte','Telecom Fictícia Sinal+'],invest:['Corporação Aurora','Rede Raízes','Mercado Virtual','Seguradora Fictícia Abrigo','Jornal Fictício Tempo']};
const CTITLE={logs:['Rastrear acesso suspeito','Análise de logs de autenticação','Auditoria de logins','Logs de um cliente que perdeu o acesso','Picos de falha no login da madrugada'],logic:['Cofre de testes autorizado','Reconstruir sequência de chaves','Enigma de acesso','Validar código de um cofre de laboratório','Sequência de senhas de um protótipo'],audit:['Auditoria de configuração','Checklist de conformidade','Revisão de políticas','Auditoria de backup e retenção','Revisão de permissões de pastas'],vuln:['Revisão de código seguro','Caça a falhas em módulo','Code review de segurança','Revisão de formulário de cadastro','Análise de uma API fictícia'],defense:['Resposta a incidente','Escudo de servidor','Plantão de defesa','Proteção de site durante lançamento','Contenção de tráfego anômalo'],invest:['Investigação de vazamento','Linha do tempo do incidente','Quem acessou o arquivo?','Acesso fora do horário no setor financeiro','Documento copiado sem autorização']};
