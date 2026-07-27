import { calcularResultado } from '../logic.js';
import { COZINHEIRO_CONFIG, RESULTADO_FORMAT, ATRIBUTOS, XP_COZINHEIRO, DIFICULDADES_VALOR } from '../constants.js';
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
        const $html = $(html);
        const getRefeicoesProntas = () => actor.getFlag("professions-reworked-5e", "refeicoesProntas") || [];
        const getCookParams = () => {
            const defaults = { atributoPadrao: "wis", usoVantagem: false, usoDesvantagem: false, bonusSituacional: "" };
            return foundry.utils.mergeObject(defaults, actor.getFlag("professions-reworked-5e", "cookParams") || {});
        };

        $html.find('.cook-attribute').off('change.professions').on('change.professions', async (ev) => {
            salvarScroll();
            const cookParams = getCookParams();
            cookParams.atributoPadrao = ev.currentTarget.value;
            await actor.setFlag("professions-reworked-5e", "cookParams", cookParams);
        });

        $html.find('.cook-adv-checkbox').off('change.professions').on('change.professions', async (ev) => {
            salvarScroll();
            const cookParams = getCookParams();
            cookParams.usoVantagem = ev.currentTarget.checked;
            await actor.setFlag("professions-reworked-5e", "cookParams", cookParams);
        });

        $html.find('.cook-disadv-checkbox').off('change.professions').on('change.professions', async (ev) => {
            salvarScroll();
            const cookParams = getCookParams();
            cookParams.usoDesvantagem = ev.currentTarget.checked;
            await actor.setFlag("professions-reworked-5e", "cookParams", cookParams);
        });

        $html.find('.cook-bonus').off('change.professions').on('change.professions', async (ev) => {
            salvarScroll();
            const cookParams = getCookParams();
            cookParams.bonusSituacional = ev.currentTarget.value;
            await actor.setFlag("professions-reworked-5e", "cookParams", cookParams);
        });

        $html.find('.delete-meal').off('click.professions').on('click.professions', async (ev) => {
            salvarScroll();
            const card = ev.currentTarget.closest('.meal-card');
            const index = parseInt(card.dataset.index);
            const refeicoesProntas = getRefeicoesProntas();
            if (!isNaN(index) && refeicoesProntas[index]) {
                refeicoesProntas.splice(index, 1);
                await actor.setFlag("professions-reworked-5e", "refeicoesProntas", refeicoesProntas);
            }
        });

        $html.find('.cook-test').off('click.professions').on('click.professions', async (ev) => {
            salvarScroll();
            const tipo = ev.currentTarget.dataset.type;
            const cookParams = getCookParams();
            const refeicoesProntas = getRefeicoesProntas();
            const ferramentasEquipadas = actor.getFlag("professions-reworked-5e", "ferramentasEquipadas") || {};
            const toolItemId = ferramentasEquipadas["Cozinheiro"];
            const toolItem = actor.items.get(toolItemId);

            if (!toolItem || toolItem.type !== "tool" || toolItem.system.type.baseItem !== "cook") {
                ui.notifications.warn("Selecione Utensílios de Cozinheiro válidos e equipados no painel!");
                return;
            }

            const attrKey = cookParams.atributoPadrao || "wis";
            const attrMod = actor.system.abilities[attrKey].mod;
            const attrLabel = ATRIBUTOS[attrKey];
            const toolProf = toolItem.system.prof?.hasProficiency ? (toolItem.system.prof.flat || (actor.system.attributes.prof * (toolItem.system.prof.multiplier || 1))) : 0;
            const toolName = toolItem.name;

            const hasAdv = cookParams.usoVantagem || false;
            const hasDis = cookParams.usoDesvantagem || false;
            const bonusSit = cookParams.bonusSituacional || "";

            let diceFormula = "1d20";
            if (hasAdv && !hasDis) diceFormula = "2d20kh1";
            else if (!hasAdv && hasDis) diceFormula = "2d20kl1";

            let formula = `${diceFormula} + ${attrMod}[${attrLabel}] + ${toolProf}[${toolName}]`;
            if (bonusSit) formula += ` + ${bonusSit}[Sit]`;

            try {
                const r = new Roll(formula, actor.getRollData());
                await r.evaluate();

                const configPreparo = COZINHEIRO_CONFIG[tipo];
                const diffAlvo = configPreparo ? configPreparo.dificuldade : "Médio";
                const res = calcularResultado(r.total, diffAlvo);
                const cfg = RESULTADO_FORMAT[res.resultado] || { label: res.resultado, color: "black", bg: "#eee", border: "#ccc" };

                if (tipo === "BANQUETE") {
                    const formulaPV = configPreparo?.resultados[res.resultado] || "0";
                    let tempHP = 0;

                    if (formulaPV !== "0") {
                        try {
                            const level = actor.system.details?.level || actor.system.details?.cr || 1;
                            const rollPV = new Roll(formulaPV, { level: level });
                            await rollPV.evaluate();
                            tempHP = rollPV.total;
                        } catch (errPV) {
                            console.error("Erro ao rolar PV do Banquete:", errPV);
                            tempHP = Math.floor(r.total / 2);
                        }
                    }

                    const refeicaoObj = {
                        nome: "Banquete",
                        resultado: `${tempHP} PV Temporários`,
                        tempHP: tempHP,
                        timestamp: Date.now(),
                        xpColetado: false
                    };

                    refeicoesProntas.push(refeicaoObj);

                    const contentHTML = `
                        <div style="border: 2px solid ${cfg.border}; background-color: ${cfg.bg}; padding: 8px; text-align: center; color: black; border-radius: 5px; font-family: 'Signika', sans-serif;">
                            <h3 style="color: ${cfg.color}; border-bottom: 1px solid ${cfg.border}; margin: 0 0 5px 0; font-weight: bold;">
                                Banquete &mdash; ${cfg.label}
                            </h3>
                            <div style="font-size: 12px; margin-bottom: 5px; color: #444;">
                                <strong>Preparo de Banquete</strong> (Dificuldade: ${diffAlvo})
                            </div>
                            <div style="font-size: 14px; font-weight: bold; color: ${cfg.color}; margin-top: 5px;">
                                Total: ${r.total} &mdash; ${cfg.label} <span style="font-size: 12px; color: #555;">(${tempHP} PV Temporários)</span>
                            </div>
                        </div>
                    `;

                    await actor.setFlag("professions-reworked-5e", "refeicoesProntas", refeicoesProntas);

                    r.toMessage({
                        speaker: ChatMessage.getSpeaker({ actor }),
                        flavor: contentHTML
                    });

                } else {
                    const baseNome = (configPreparo?.resultados[res.resultado]) || "Poor";
                    const qualidade = `${baseNome} meal`;

                    const refeicaoObj = {
                        nome: (tipo === "BAIXA_QUALIDADE") ? "Refeição de Baixa Qualidade" : "Refeição de Alta Qualidade",
                        resultado: qualidade,
                        resultadoRolagem: cfg.label,
                        timestamp: Date.now(),
                        xpColetado: false
                    };

                    refeicoesProntas.push(refeicaoObj);

                    const contentHTML = `
                        <div style="border: 2px solid ${cfg.border}; background-color: ${cfg.bg}; padding: 8px; text-align: center; color: black; border-radius: 5px; font-family: 'Signika', sans-serif;">
                            <h3 style="color: ${cfg.color}; border-bottom: 1px solid ${cfg.border}; margin: 0 0 5px 0; font-weight: bold;">
                                ${(tipo === "BAIXA_QUALIDADE") ? "Refeição de Baixa Qualidade" : "Refeição de Alta Qualidade"} &mdash; ${cfg.label}
                            </h3>
                            <div style="font-size: 12px; margin-bottom: 5px; color: #444;">
                                <strong>Resultado do Teste:</strong> ${cfg.label} (Dificuldade: ${diffAlvo})
                            </div>
                            <div style="font-size: 14px; font-weight: bold; color: ${cfg.color}; margin-top: 5px;">
                                Refeição Preparada: <span>${qualidade}</span>
                            </div>
                        </div>
                    `;

                    await actor.setFlag("professions-reworked-5e", "refeicoesProntas", refeicoesProntas);

                    r.toMessage({
                        speaker: ChatMessage.getSpeaker({ actor }),
                        flavor: contentHTML
                    });
                }

            } catch (err) {
                ui.notifications.error("Erro na rolagem de cozinha: " + err.message);
            }
        });

        $html.find('.xp-meal-btn').off('click.professions').on('click.professions', async (ev) => {
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
                qualidadeChave = (refeicao.resultado || "").replace(" meal", "").trim();
            }

            const xpAmount = XP_COZINHEIRO[isProf][qualidadeChave] || 0;

            treino.acertosAtuais += xpAmount;
            if (treino.acertosAtuais > treino.totalNecessario) treino.acertosAtuais = treino.totalNecessario;

            refeicao.xpColetado = true;

            let textoRefeicaoDisplay = `${refeicao.nome} (${refeicao.resultado})`;

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

        $html.find('.get-meal-reward-btn').off('click.professions').on('click.professions', async (ev) => {
            ev.stopPropagation();
            salvarScroll();
            const card = ev.currentTarget.closest('.meal-card');
            const index = parseInt(card.dataset.index);
            const refeicoesProntas = getRefeicoesProntas();
            const refeicao = refeicoesProntas[index];

            if (!refeicao) return;

            let itemKey = refeicao.resultado || "";
            if (refeicao.nome === "Banquete") {
                itemKey = "Banquete";
            } else {
                itemKey = itemKey.replace(" meal", "").trim();
            }

            const categoriaItem = RECOMPENSAS["Cozinheiro"];
            let configItem = categoriaItem ? categoriaItem[itemKey] : null;

            if (!configItem) {
                ui.notifications.warn(`Recompensa para "${itemKey}" não configurada no repositório de Cozinheiro.`);
                return;
            }

            // Clona o configItem para não alterar a constante global
            configItem = foundry.utils.deepClone(configItem);

            if (itemKey === "Banquete" && configItem.system?.description?.value) {
                const hpVal = (typeof refeicao.tempHP === "number") ? refeicao.tempHP : 0;
                configItem.system.description.value = configItem.system.description.value.replace("[value]", hpVal);
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
