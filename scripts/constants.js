/**
 * Matriz de Dificuldade
 * Cada nível de dificuldade define os limiares para os 11 resultados possíveis.
 */
export const TABELA_DIFICULDADE = {
    "Muito Fácil":      { g_sucesso: 16, a_sucesso: 14, m_sucesso: 12, sucesso: 10, b_sucesso: 8, media: 6, b_falha: 4, falha: 3, m_falha: 1, a_falha: -2, g_falha: -3 },
    "Fácil":            { g_sucesso: 20, a_sucesso: 17, m_sucesso: 15, sucesso: 13, b_sucesso: 11, media: 9, b_falha: 7, falha: 5, m_falha: 4, a_falha: 2, g_falha: -1 },
    "Médio":            { g_sucesso: 25, a_sucesso: 22, m_sucesso: 19, sucesso: 17, b_sucesso: 15, media: 13, b_falha: 11, falha: 9, m_falha: 7, a_falha: 6, g_falha: 4 },
    "Difícil":          { g_sucesso: 32, a_sucesso: 28, m_sucesso: 25, sucesso: 22, b_sucesso: 20, media: 18, b_falha: 16, falha: 14, m_falha: 12, a_falha: 10, g_falha: 9 },
    "Muito Difícil":    { g_sucesso: 40, a_sucesso: 36, m_sucesso: 32, sucesso: 29, b_sucesso: 26, media: 24, b_falha: 22, falha: 20, m_falha: 18, a_falha: 16, g_falha: 14 },
    "Quase Impossível": { g_sucesso: 50, a_sucesso: 45, m_sucesso: 41, sucesso: 37, b_sucesso: 34, media: 31, b_falha: 29, falha: 27, m_falha: 25, a_falha: 23, g_falha: 21 }
};

export const DIFICULDADES_VALOR = {
    "Muito Fácil": 5,
    "Fácil": 10,
    "Médio": 15,
    "Difícil": 20,
    "Muito Difícil": 25,
    "Quase Impossível": 30
};

export const TREINAMENTO_CONFIG = {
    "Atributo": { icon: "fa-dumbbell", label: "Treinamento de Atributo" },
    "Perícia":  { icon: "fa-book-reader", label: "Treinamento de Perícia" },
    "Talento":  { icon: "fa-star", label: "Treinamento de Talento" },
    "Profissão":{ icon: "fa-tools", label: "Treinamento de Profissão" },
    "Idioma":   { icon: "fa-language", label: "Estudo de Idioma" },
    "Resistência": { icon: "fa-shield-alt", label: "Treino de Resistência" }
};

/**
 * Tabela de Profissões e Ferramentas
 * Mapeia cada profissão às ferramentas do sistema D&D 5e e tipos de itens.
 */
export const PROFISSOES_CONFIG = {
    "Alquimista":  { ferramenta: "alchemist",  subTipos: ["Item de Aventureiro", "Poção"] },
    "Carpinteiro": { ferramenta: "woodcarver", subTipos: ["Item de Aventureiro", "Arma de Madeira", "Escudo", "Peça de Madeira", "Preparo para Encantamento"] },
    "Cartógrafo":  { ferramenta: "cartographer",subTipos: ["Cópia de Mapa", "Desenho de Mapa"] },
    "Cozinheiro":  { ferramenta: "cook",       subTipos: ["Refeição de Baixa Qualidade", "Refeição de Alta Qualidade", "Banquete"] },
    "Coureiro":    { ferramenta: "leatherworker", subTipos: ["Item de Aventureiro","Armadura de Couro", "Arma de Couro", "Item de Couro", "Conserto", "Preparo para Encantamento"] },
    "Engenheiro":  { ferramenta: "tinker",     subTipos: ["Mecanismo", "Mecanismo Improvisado", "Planos de Estruturas", "Conserto", "Preparo para Encantamento"] },
    "Escriba":     { ferramenta: "calligrapher", subTipos: ["Cópia de Texto", "Obra de Arte", "Escrita de Livro", "Pergaminho de Magia"] },
    "Ferreiro":    { ferramenta: "smith",      subTipos: ["Item de Aventureiro", "Armadura de Metal", "Arma de Metal", "Conserto", "Preparo para Encantamento" ] },
    "Herbalista":  { ferramenta: "herb",  subTipos: ["Temperos e Especiarias", "Tintura Mundana", "Erva de Poção", "Tintura Mágica"] },
    "Joalheiro":   { ferramenta: "jeweler",    subTipos: ["Bijuteria", "Gema Lapidada", "Encrustar Gemas para Encantamento"] },
    "Oleiro":      { ferramenta: "potter",     subTipos: ["Item de Aventureiro de Argila", "Item de Aventureiro de Vidro", "Peça de Argila", "Peça de Vidro", "Preparo para Encantamento"] },
    "Pedreiro":    { ferramenta: "mason",      subTipos: ["Peça de Pedra", "Preparo para Encantamento"] },
    "Sicário":     { ferramenta: "pois",   subTipos: ["Veneno Básico", "Veneno Avançado", "Coleta de Veneno de Monstro", "Coleta de Erva Venenosa"] },
    "Tecelão":     { ferramenta: "weaver",     subTipos: ["Item de Aventureiro", "Peça de Tecido", "Conserto", "Preparo para Encantamento"] }
};


// Configuração de Treinamento de Atributos ---
// Formato: { max: ValorMaximoInclusivo, meta: XP, diff: "Dificuldade" }
export const TREINO_ATRIBUTO_RANGES = [
    { max: 5,  meta: 10, diff: "Muito Fácil" },
    { max: 11, meta: 20, diff: "Muito Fácil" },
    { max: 16, meta: 30, diff: "Fácil" },
    { max: 19, meta: 60, diff: "Médio" },
    { max: 30, meta: 100, diff: "Difícil" } // Fallback para 20+ (Deuses/Épicos) - Gemini meteu isso aqui slc caba eh piroca da cabeça
];

/**
 * Conversão de Consequências em Acertos
 */
export const VALOR_ACERTOS = {
    "GRANDE_SUCESSO": 2,
    "ALTO_SUCESSO": 2,
    "MEDIO_SUCESSO": 1,
    "SUCESSO": 1,
    "BAIXO_SUCESSO": 1,
    "MEDIA": 0.5,
    "BAIXA_FALHA": 0.5,
    "FALHA": 0.25,
    "MEDIA_FALHA": 0.25,
    "ALTA_FALHA": 0,
    "GRANDE_FALHA": 0
};

// Tabela de Línguas e Scripts ---
// Chave: Nome da Língua (Display) | Valor: Nome do Script (Alfabeto)
export const LANGUAGES_DATA = {
    "Common": "Common",
    "Dwarvish": "Dwarvish",
    "Elvish": "Elvish",
    "Giant": "Dwarvish",
    "Gnomish": "Dwarvish",
    "Goblin": "Dwarvish",
    "Halfling": "Common",
    "Orc": "Dwarvish",
    "Aarakocra": "Dwarvish", // Corrigido typo "Aaracokra" para padrão D&D
    "Abyssal": "Infernal",
    "Celestial": "Celestial",
    "Draconic": "Draconic",
    "Gith": "Tir'su",
    "Deep Speech": null, // Sem script
    "Gnoll": "Infernal",
    "Infernal": "Infernal",
    "Aquan": "Dwarvish",
    "Auran": "Dwarvish",
    "Ignan": "Dwarvish",
    "Terran": "Dwarvish",
    "Sylvan": "Elvish",
    "Undercommon": "Elvish",
    "Druidic": "Druidic",
    "Thieve's Cant": "Thieve's Cant"
};

//Lista de tabelas específicas das profissões
export const ALQUIMISTA_POCAO = {
    "Comum":      { complexidade: "Simples",                dificuldade: "Muito Fácil" },
    "Incomum":    { complexidade: "Simples",                dificuldade: "Fácil" },
    "Raro":       { complexidade: "Moderadamente Complexo", dificuldade: "Médio" },
    "Muito Raro": { complexidade: "Complexo",               dificuldade: "Difícil" },
    "Lendário":   { complexidade: "Muito Complexo",         dificuldade: "Muito Difícil" }
};
export const CARPINTEIRO_ARMA = {
    "Simples": { complexidade: "Simples" },
    "Marcial": { complexidade: "Moderadamente Complexo" }
};
export const COUREIRO_ARMADURA = {
    "Armadura Leve":  { complexidade: "Moderadamente Complexo" },
    "Armadura Média": { complexidade: "Moderadamente Complexo" }
};

export const COUREIRO_ARMA = {
    "Estilingue": { complexidade: "Simples" },
    "Chicote":    { complexidade: "Simples" }
};
export const FERREIRO_ARMADURA = {
    "Armadura Média":  { complexidade: "Moderadamente Complexo" },
    "Armadura Pesada": { complexidade: "Complexo" } // Lógica de Placas será tratada no main.js
};

export const FERREIRO_ARMA = {
    "Arma Simples": { complexidade: "Simples" },
    "Arma Marcial": { complexidade: "Moderadamente Complexo" }
};

export const JOALHEIRO_GEMA = {
    "Comum":    { complexidade: "Complexo" },       // Dificuldade: Difícil
    "Rara":     { complexidade: "Complexo" },       // Dificuldade: Difícil
    "Épica":    { complexidade: "Muito Complexo" }, // Dificuldade: Muito Difícil
    "Lendária": { complexidade: "Muito Complexo" }  // Dificuldade: Muito Difícil
};
export const JOALHEIRO_ENCRUSTAR = {
    "Comum":      { dificuldade: "Fácil" },
    "Incomum":    { dificuldade: "Médio" },
    "Raro":       { dificuldade: "Difícil" },
    "Muito Raro": { dificuldade: "Muito Difícil" },
    "Lendário":   { dificuldade: "Quase Impossível" }
};
export const ESCRIBA_PERGAMINHO = {
    "Comum":      { complexidade: "Simples", dificuldade: "Muito Fácil" },
    "Incomum":    { complexidade: "Moderadamente Complexo", dificuldade: "Fácil" },
    "Raro":       { complexidade: "Moderadamente Complexo", dificuldade: "Médio" },
    "Muito Raro": { complexidade: "Complexo", dificuldade: "Difícil" },
    "Lendário":   { complexidade: "Muito Complexo", dificuldade: "Muito Difícil" }
};
export const SICARIO_DRAGAO = {
    "Filhote": { dificuldade: "Fácil" },
    "Jovem":   { dificuldade: "Médio" },
    "Adulto":  { dificuldade: "Difícil" },
    "Ancião":  { dificuldade: "Muito Difícil" }
};

// Dificuldade para Coleta de Veneno de Monstro
export const SICARIO_COLETA_DIFF = {
    "Veneno Básico":          { dificuldade: "Fácil" },
    "Veneno Avançado":        { dificuldade: "Médio" },
    "Veneno de Dragão Verde": { dificuldade: "Difícil" }
};

// Tabela de Doses Coletadas (Fórmula de Dados por Resultado)
export const SICARIO_DOSES = {
    "GRANDE_SUCESSO": "8d4", "ALTO_SUCESSO": "8d4",
    "MEDIO_SUCESSO":  "6d4", "SUCESSO":      "6d4", "BAIXO_SUCESSO": "6d4",
    "MEDIA":          "4d4", "BAIXA_FALHA":  "4d4",
    "FALHA":          "2d4", "MEDIA_FALHA":  "2d4",
    "ALTA_FALHA":     "0",   "GRANDE_FALHA": "0"
};
export const HERBALISTA_BIOMAS = [
    "Floresta", "Pradaria", "Montanha", "Pântano", "Deserto", "Tundra", "Underdark"
];
export const CARTOGRAFO_BIOMAS_LISTA = [
    "Floresta", "Pradaria", "Montanha", "Pântano", "Deserto", "Tundra", "Underdark"
];


// Mapeia o Subtipo -> Meta de Acertos (Complexidade)
export const HERBALISTA_META = {
    "Temperos e Especiarias": "Simples",
    "Tintura Mundana": "Simples",
    "Erva de Poção": "Moderadamente Complexo",
    // Tinturas Mágicas variam por Raridade (definido na lógica)
};

// Matriz de Dificuldade: [Tabela][Bioma] = Dificuldade
export const HERBALISTA_MATRIZ = {
    "padrao": { // Temperos e Tinturas Mundanas
        "Floresta": "Muito Fácil", "Pradaria": "Fácil", "Montanha": "Médio", "Pântano": "Médio", "Underdark": "Médio", "Deserto": "Difícil", "Tundra": "Difícil"
    },
    "uva": { // Erva de Poção (Usa 'uva' pq sim, ou 'potion' rs)
        "Floresta": "Fácil", "Pradaria": "Médio", "Montanha": "Difícil", "Pântano": "Difícil", "Underdark": "Difícil", "Deserto": "Muito Difícil", "Tundra": "Muito Difícil"
    },
    "comum": { // Mágica Comum
        "Floresta": "Fácil", "Pradaria": "Fácil", "Montanha": "Médio", "Pântano": "Médio", "Underdark": "Médio", "Deserto": "Difícil", "Tundra": "Difícil"
    },
    "incomum": { // Mágica Incomum
        "Floresta": "Médio", "Pradaria": "Médio", "Montanha": "Difícil", "Pântano": "Difícil", "Underdark": "Difícil", "Deserto": "Muito Difícil", "Tundra": "Muito Difícil"
    },
    "raro": { // Mágica Rara
        "Floresta": "Difícil", "Pradaria": "Difícil", "Montanha": "Muito Difícil", "Pântano": "Muito Difícil", "Underdark": "Muito Difícil", "Deserto": "Quase Impossível", "Tundra": "Quase Impossível"
    },
    "muito_raro": { // Mágica Muito Rara (Sem Tundra/Deserto)
        "Floresta": "Muito Difícil", "Pradaria": "Muito Difícil", "Montanha": "Quase Impossível", "Pântano": "Quase Impossível", "Underdark": "Quase Impossível", "Deserto": null, "Tundra": null
    },
    "lendario": { // Mágica Lendária (Sem Tundra/Deserto/Montanha)
        "Floresta": "Quase Impossível", "Pradaria": "Quase Impossível", "Pântano": "Quase Impossível", "Underdark": "Quase Impossível", "Montanha": null, "Deserto": null, "Tundra": null
    }
};
// Dificuldade por Bioma Cartografo (Fase Rascunho)
export const CARTOGRAFO_BIOMA_DIFF = {
    "Tundra":    "Fácil",
    "Deserto":   "Fácil",
    "Pradaria":  "Fácil",
    "Montanha":  "Médio",
    "Floresta":  "Médio",
    "Pântano":   "Difícil",
    "Underdark": "Difícil"
};

// Incremento de Meta por Resultado (Quanto pior, mais trabalho adiciona)
export const CARTOGRAFO_RASCUNHO_INC = {
    "GRANDE_SUCESSO": 0.25, "ALTO_SUCESSO": 0.25,
    "MEDIO_SUCESSO":  0.5,  "SUCESSO":      0.5,  "BAIXO_SUCESSO": 0.5,
    "MEDIA":          0.75, "BAIXA_FALHA":  0.75,
    "FALHA":          1,    "MEDIA_FALHA":  1,
    "ALTA_FALHA":     1.25, "GRANDE_FALHA": 1.25
};

export const COZINHEIRO_CONFIG = {
    "BAIXA_QUALIDADE": {
        dificuldade: "Fácil",
        resultados: {
            "GRANDE_SUCESSO": "Comfortable",
            "ALTO_SUCESSO":   "Comfortable",
            "MEDIO_SUCESSO":  "Modest",
            "SUCESSO":        "Modest",
            "BAIXO_SUCESSO":  "Poor",
            "MEDIA":          "Poor",
            "BAIXA_FALHA":    "Poor",
            "FALHA":          "Poor",
            "MEDIA_FALHA":    "Poor",
            "ALTA_FALHA":     "Squalid",
            "GRANDE_FALHA":   "Squalid"
        }
    },
    "ALTA_QUALIDADE": {
        dificuldade: "Médio",
        resultados: {
            "GRANDE_SUCESSO": "Aristocrat",
            "ALTO_SUCESSO":   "Aristocrat",
            "MEDIO_SUCESSO":  "Wealthy",
            "SUCESSO":        "Wealthy",
            "BAIXO_SUCESSO":  "Comfortable",
            "MEDIA":          "Comfortable",
            "BAIXA_FALHA":    "Comfortable",
            "FALHA":          "Comfortable",
            "MEDIA_FALHA":    "Comfortable",
            "ALTA_FALHA":     "Modest",
            "GRANDE_FALHA":   "Modest"
        }
    },
    "BANQUETE": {
        dificuldade: "Muito Difícil",
        resultados: {
            "GRANDE_SUCESSO": "4d10 + @level",
            "ALTO_SUCESSO":   "4d10 + @level",
            "MEDIO_SUCESSO":  "3d10 + ceil(@level / 2)",
            "SUCESSO":        "3d10 + ceil(@level / 2)",
            "BAIXO_SUCESSO":  "3d10 + ceil(@level / 2)",
            "MEDIA":          "2d10 + ceil(@level / 2)",
            "BAIXA_FALHA":    "2d10 + ceil(@level / 2)",
            "FALHA":          "1d10 + ceil(@level / 2)",
            "MEDIA_FALHA":    "1d10 + ceil(@level / 2)",
            "ALTA_FALHA":     "0",
            "GRANDE_FALHA":   "0"
        }
    }
};
/**
 * Definição dos objetivos de projeto (Hits necessários)
 * Baseado na complexidade definida no seu sistema.
 */
export const COMPLEXIDADE_PROJETO = {
    "Simples": {
        acertosNecessarios: 2,
        dificuldade: "Fácil", // Adicionado
        descricao: "Um item básico ou reparo simples."
    },
    "Moderadamente Complexo": {
        acertosNecessarios: 4,
        dificuldade: "Médio", // Adicionado
        descricao: "Um item de qualidade padrão ou trabalho detalhado."
    },
    "Complexo": {
        acertosNecessarios: 8,
        dificuldade: "Difícil", // Adicionado
        descricao: "Um item magistral ou estrutura técnica."
    },
    "Muito Complexo": {
        acertosNecessarios: 16,
        dificuldade: "Muito Difícil", // Adicionado
        descricao: "Uma obra lendária ou engenharia avançada."
    }
};
// --- NOVO: Tabela de Preparo para Encantamento ---
// Matriz: [Raridade][Complexidade do Item Base] = Acertos Necessários
// IMPORTANTE: Edite os números abaixo conforme sua tabela!
export const PREPARO_ENCANTAMENTO = {
    "Comum": {
        "Simples": 8,
        "Moderadamente Complexo": 6,
        "Complexo": 4,
        "Muito Complexo": 2
    },
    "Incomum": {
        "Simples": 9,
        "Moderadamente Complexo": 7,
        "Complexo": 5,
        "Muito Complexo": 3
    },
    "Raro": {
        "Simples": 11,
        "Moderadamente Complexo": 9,
        "Complexo": 7,
        "Muito Complexo": 5
    },
    "Muito Raro": {
        "Simples": 13,
        "Moderadamente Complexo": 11,
        "Complexo": 9,
        "Muito Complexo": 7
    },
    "Lendário": {
        "Simples": 15,
        "Moderadamente Complexo": 13,
        "Complexo": 11,
        "Muito Complexo": 9
    }
};

// Qualidade da Refeição (Cozinheiro) -> XP
export const XP_COZINHEIRO = {
    "sem_proficiencia": { // Multiplier < 1
        "Squalid": 0, "Poor": 0.5, "Modest": 1, "Comfortable": 1.5, "Wealthy": 2, "Aristocrat": 2.5, "Banquete": 3
    },
    "proficiente": { // Multiplier >= 1
        "Squalid": 0, "Poor": 0, "Modest": 0, "Comfortable": 0.5, "Wealthy": 1, "Aristocrat": 2, "Banquete": 3
    }
};

// Tipo de Veneno Coletado (Sicário) -> XP (Apenas se doses > 0)
export const XP_VENENO_COLETA = {
    "sem_proficiencia": { 
        "Veneno Básico": 2, "Veneno Avançado": 8, "Veneno de Dragão Verde": 12 
    },
    "proficiente": { 
        "Veneno Básico": 1, "Veneno Avançado": 5, "Veneno de Dragão Verde": 10 
    }
};

export const RESULTADO_FORMAT = {
    "GRANDE_SUCESSO": { label: "Grande Sucesso", color: "#006400", bg: "#edffed", border: "#006400" },
    "ALTO_SUCESSO":   { label: "Alto Sucesso",   color: "#006400", bg: "#edffed", border: "#006400" },
    "MEDIO_SUCESSO":  { label: "Médio Sucesso",  color: "#005a9c", bg: "#e6f2ff", border: "#005a9c" },
    "SUCESSO":        { label: "Sucesso",        color: "#005a9c", bg: "#e6f2ff", border: "#005a9c" },
    "BAIXO_SUCESSO":  { label: "Baixo Sucesso",  color: "#b8860b", bg: "#fff8e1", border: "#b8860b" },
    "MEDIA":          { label: "Média",          color: "#b8860b", bg: "#fff8e1", border: "#b8860b" },
    "BAIXA_FALHA":    { label: "Baixa Falha",    color: "#c0392b", bg: "#fadbd8", border: "#c0392b" },
    "FALHA":          { label: "Falha",          color: "#c0392b", bg: "#fadbd8", border: "#c0392b" },
    "MEDIA_FALHA":    { label: "Média Falha",    color: "#8b0000", bg: "#e6b0aa", border: "#8b0000" },
    "ALTA_FALHA":     { label: "Alta Falha",     color: "#555555", bg: "#dcdcdc", border: "#555555" },
    "GRANDE_FALHA":   { label: "Grande Falha",   color: "#000000", bg: "#cccccc", border: "#000000" }
};

export const ATRIBUTOS = {
    "str": "Força", "dex": "Destreza", "con": "Constituição", 
    "int": "Inteligência", "wis": "Sabedoria", "cha": "Carisma"
};