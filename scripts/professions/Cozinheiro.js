import { calcularResultado } from '../logic.js';
import { COZINHEIRO_CONFIG, RESULTADO_FORMAT, ATRIBUTOS, XP_COZINHEIRO } from '../constants.js';
import { RECOMPENSAS } from '../items_data.js';
import { abrirDialogoRecompensa } from '../main.js';

export function processarCozinheiro(total, tipoPreparo) {
    const config = COZINHEIRO_CONFIG[tipoPreparo];
    if (!config) {
        console.error(`Profissões Dinâmicas | Tipo de preparo não encontrado: ${tipoPreparo}`);
        return { efeitoFinal: "Erro", resultadoMatematico: "FALHA" };
    }
    const base = calcularResultado(total, config.dificuldade);
    const efeito = config.resultados[base.resultado];

    return {
        preparo: tipoPreparo,
        dificuldadeUsada: config.dificuldade,
        resultadoMatematico: base.resultado,
        efeitoFinal: efeito
    };
}

export const Cozinheiro = {
    nome: "Cozinheiro",

    atualizarDropdown(container) {
        // Cozinheiro não usa o dropdown de criação padrão
    },

    onCreateProject(projectData, container, { actor }) {
        return true;
    },

    prepareProject(projeto, comp, { actor }) {
        return null;
    },

    registerListeners(html, actor, { salvarScroll, tabParaManter, app }) {
        const getRefeicoesProntas = () => actor.getFlag("professions-reworked-5e", "refeicoesProntas") || [];
        const getCookParams = () => {
            const defaults = { atributoPadrao: "wis", usoVantagem: false, usoDesvantagem: false, bonusSituacional: "" };
            return foundry.utils.mergeObject(defaults, actor.getFlag("professions-reworked-5e", "cookParams") || {});
        };

        html.find('.cook-attribute').change(async (ev) => {
            salvarScroll();
            const cookParams = getCookParams();
            cookParams.atributoPadrao = ev.currentTarget.value;
            await actor.setFlag("professions-reworked-5e", "cookParams", cookParams);
        });

        html.find('.cook-adv-checkbox').change(async (ev) => {
            salvarScroll();
            const cookParams = getCookParams();
            cookParams.usoVantagem = ev.currentTarget.checked;
            await actor.setFlag("professions-reworked-5e", "cookParams", cookParams);
        });

        html.find('.cook-disadv-checkbox').change(async (ev) => {
            salvarScroll();
            const cookParams = getCookParams();
            cookParams.usoDesvantagem = ev.currentTarget.checked;
            await actor.setFlag("professions-reworked-5e", "cookParams", cookParams);
        });

        html.find('.cook-bonus').change(async (ev) => {
            salvarScroll();
            const cookParams = getCookParams();
            cookParams.bonusSituacional = ev.currentTarget.value;
            await actor.setFlag("professions-reworked-5e", "cookParams", cookParams);
        });

        html.find('.delete-meal').click(async (ev) => {
            salvarScroll();
            const card = ev.currentTarget.closest('.meal-card');
            const index = parseInt(card.dataset.index);
            const refeicoesProntas = getRefeicoesProntas();
            if (!isNaN(index) && refeicoesProntas[index]) {
                refeicoesProntas.splice(index, 1);
                await actor.setFlag("professions-reworked-5e", "refeicoesProntas", refeicoesProntas);
            }
        });

        html.find('.cook-test').click(async (ev) => {
            salvarScroll();
            const tipo = ev.currentTarget.dataset.type;
            const cookParams = getCookParams();
            const refeicoesProntas = getRefeicoesProntas();
            const ferramentasEquipadas = actor.getFlag("professions-reworked-5e", "ferramentasEquipadas") || {};

            const attributeKey = cookParams.atributoPadrao || "wis";
            const hasAdvantage = cookParams.usoVantagem || false;
            const hasDisadvantage = cookParams.usoDesvantagem || false;
            const situationalBonus = cookParams.bonusSituacional || "";

            const toolId = ferramentasEquipadas["Cozinheiro"] || "";
            const hasTool = toolId !== "";
            const attrMod = actor.system.abilities[attributeKey].mod;
            const attrLabel = ATRIBUTOS[attributeKey];

            let profBonus = 0;
            let toolLabel = "Sem Ferramenta";

            if (hasTool) {
                const toolItem = actor.items.get(toolId);
                if (toolItem) {
                    toolLabel = toolItem.name;
                    const profMultiplier = toolItem.system.prof?.multiplier || 0;
                    profBonus = Math.floor(actor.system.attributes.prof * profMultiplier);
                }
            }

            let diceFormula = "1d20";
            if (hasTool && hasAdvantage && !hasDisadvantage) {
                diceFormula = "2d20kh1";
            } else if (!hasAdvantage && (hasDisadvantage || !hasTool)) {
                diceFormula = "2d20kl1";
            }

            let formula = `${diceFormula} + ${attrMod}[${attrLabel}]`;
            if (profBonus > 0) formula += ` + ${profBonus}[Prof]`;
            if (situationalBonus) formula += ` + ${situationalBonus}[Sit]`;

            try {
                const r = new Roll(formula, actor.getRollData());
                await r.evaluate();
                const resCozinha = processarCozinheiro(r.total, tipo);
                let resultadoTexto = resCozinha.efeitoFinal;

                if (tipo === "BANQUETE" && resultadoTexto !== "0") {
                    if (resultadoTexto.includes("d")) {
                        try {
                            const level = actor.system.details?.cr || actor.system.details?.level || 1;
                            const rollPV = new Roll(resultadoTexto, { level: level });
                            await rollPV.evaluate();
                            resultadoTexto = `<strong>${rollPV.total} PV Temporários!</strong>`;
                        } catch (innerErr) {
                            console.error("Erro interno no Banquete:", innerErr);
                            resultadoTexto += " (Erro calc.)";
                        }
                    }
                }

                const cfg = RESULTADO_FORMAT[resCozinha.resultadoMatematico] || { label: resCozinha.resultadoMatematico, color: "black", bg: "#eee", border: "#ccc" };
                const tipoLegivel = tipo.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

                const contentHTML = `
                    <div style="border: 2px solid ${cfg.border}; background-color: ${cfg.bg}; padding: 8px; text-align: center; color: black; border-radius: 5px; font-family: 'Signika', sans-serif;">
                        <h3 style="color: ${cfg.color}; border-bottom: 1px solid ${cfg.border}; margin: 0 0 5px 0; font-weight: bold;">
                            ${cfg.label}
                        </h3>
                        <div style="font-size: 13px; margin-bottom: 5px;">
                            <strong>Cozinhando:</strong> ${tipoLegivel}<br>
                            <strong>Ferramenta:</strong> ${toolLabel}
                        </div>
                        <div style="font-size: 14px; font-weight: bold; color: #333;">
                            Resultado: <span style="color: ${cfg.color};">${resultadoTexto}</span>
                        </div>
                    </div>
                `;

                refeicoesProntas.push({ nome: tipoLegivel, resultado: resultadoTexto, timestamp: Date.now() });
                await actor.setFlag("professions-reworked-5e", "refeicoesProntas", refeicoesProntas);

                r.toMessage({
                    speaker: ChatMessage.getSpeaker({ actor }),
                    flavor: contentHTML
                });

            } catch (err) {
                ui.notifications.error("Erro na rolagem de cozinha: " + err.message);
            }
        });

        html.find('.xp-meal-btn').click(async (ev) => {
            ev.stopPropagation();
            salvarScroll();
            const card = ev.currentTarget.closest('.meal-card');
            const index = parseInt(card.dataset.index);
            const refeicoesProntas = getRefeicoesProntas();
            const refeicao = refeicoesProntas[index];

            if (!refeicao) return;

            const listaTreinamentos = actor.getFlag("professions-reworked-5e", "listaTreinamentos") || [];
            const treinoIndex = listaTreinamentos.findIndex(t =>
                t.categoria === "Profissão" &&
                t.profissaoAlvo === "Cozinheiro" &&
                t.acertosAtuais < t.totalNecessario
            );

            if (treinoIndex === -1) return;

            const treino = listaTreinamentos[treinoIndex];

            const toolItem = actor.items.find(i => i.type === "tool" && i.system.type.baseItem === "cook");
            const isProf = (toolItem && toolItem.system.prof?.multiplier >= 1) ? "proficiente" : "sem_proficiencia";

            let qualidadeChave = "";
            if (refeicao.nome === "Banquete") {
                qualidadeChave = "Banquete";
            } else {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = refeicao.resultado;
                qualidadeChave = tempDiv.textContent.trim();
            }

            const xpAmount = XP_COZINHEIRO[isProf][qualidadeChave] || 0;

            treino.acertosAtuais += xpAmount;
            if (treino.acertosAtuais > treino.totalNecessario) treino.acertosAtuais = treino.totalNecessario;

            refeicao.xpColetado = true;

            let textoRefeicaoDisplay = "";
            if (refeicao.nome === "Banquete") {
                textoRefeicaoDisplay = refeicao.nome;
            } else {
                textoRefeicaoDisplay = `${refeicao.nome} (${qualidadeChave})`;
            }

            const contentHTML = `
                <div style="border: 2px solid #b8860b; background-color: #fff8e1; padding: 8px; border-radius: 5px; font-family: 'Signika', sans-serif; color: black;">
                    <h3 style="color: #b8860b; border-bottom: 1px solid #b8860b; margin: 0 0 5px 0; text-align: center; font-weight: bold;">
                        Treinamento de Cozinheiro
                    </h3>
                    <div style="font-size: 13px; line-height: 1.4; margin-bottom: 5px;">
                        <strong>Jogador:</strong> ${actor.name}<br>
                        <strong>Refeição:</strong> ${textoRefeicaoDisplay}                  
                    </div>
                    <div style="font-size: 14px; font-weight: bold; color: #b8860b; text-align: center; margin-top: 5px;">
                        ${xpAmount} Pontos de Experiência adicionados!
                    </div>
                </div>
            `;

            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor }),
                content: contentHTML
            });

            await actor.update({
                "flags.professions-reworked-5e.refeicoesProntas": refeicoesProntas,
                "flags.professions-reworked-5e.listaTreinamentos": listaTreinamentos
            });
        });

        html.find('.get-meal-reward-btn').click(async (ev) => {
            ev.stopPropagation();
            salvarScroll();
            const card = ev.currentTarget.closest('.meal-card');
            const index = parseInt(card.dataset.index);
            const refeicoesProntas = getRefeicoesProntas();
            const refeicao = refeicoesProntas[index];

            if (!refeicao) return;

            let itemKey = refeicao.resultado;
            if (refeicao.nome === "Banquete") {
                itemKey = "Banquete";
            }



            const categoriaItem = RECOMPENSAS["Cozinheiro"];
            const configItem = categoriaItem ? categoriaItem[itemKey] : null;

            if (!configItem) {
                ui.notifications.warn(`Recompensa para "${itemKey}" não configurada no repositório de Cozinheiro.`);
                return;
            }

            await abrirDialogoRecompensa(actor, {
                nome: refeicao.nome,
                subTipo: refeicao.nome,
                resultado: refeicao.resultado,
                profissao: "Cozinheiro"
            }, configItem, async (selectedOpt) => {
                refeicao.itemColetado = true;
                await actor.setFlag("professions-reworked-5e", "refeicoesProntas", refeicoesProntas);
            }, app, null);
        });
    }
};
