import { TABELA_DIFICULDADE, VALOR_ACERTOS } from './constants.js';

/**
 * Determina qual o nível de sucesso atingido e quantos acertos ele gera.
 */
export function calcularResultado(total, dificuldade) {
    const limiares = TABELA_DIFICULDADE[dificuldade];
    
    if (!limiares) return { resultado: "GRANDE_FALHA", acertos: 0 };

    let resultado;

    if (total >= limiares.g_sucesso)      resultado = "GRANDE_SUCESSO";
    else if (total >= limiares.a_sucesso) resultado = "ALTO_SUCESSO";
    else if (total >= limiares.m_sucesso) resultado = "MEDIO_SUCESSO";
    else if (total >= limiares.sucesso)   resultado = "SUCESSO";
    else if (total >= limiares.b_sucesso) resultado = "BAIXO_SUCESSO";
    else if (total >= limiares.media)     resultado = "MEDIA";
    else if (total >= limiares.b_falha)   resultado = "BAIXA_FALHA";
    else if (total >= limiares.falha)     resultado = "FALHA";
    else if (total >= limiares.m_falha)   resultado = "MEDIA_FALHA";
    else if (total >= limiares.a_falha)   resultado = "ALTA_FALHA";
    else                                  resultado = "GRANDE_FALHA";

    return {
        resultado: resultado,
        acertos: VALOR_ACERTOS[resultado] || 0
    };
}