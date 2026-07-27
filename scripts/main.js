import { calcularResultado } from './logic.js';
import { 
    COMPLEXIDADE_PROJETO, 
    PROFISSOES_CONFIG, 
    TREINAMENTO_CONFIG, 
    XP_VENENO_COLETA, 
    XP_COZINHEIRO, 
    RESULTADO_FORMAT, 
    ATRIBUTOS 
} from './constants.js';
import { RECOMPENSAS } from './items_data.js';

// Importação das Lógicas de Profissão
import { Alquimista } from './professions/Alquimista.js';
import { Carpinteiro } from './professions/Carpinteiro.js';
import { Cartografo } from './professions/Cartografo.js';
import { Cozinheiro } from './professions/Cozinheiro.js';
import { Coureiro } from './professions/Coureiro.js';
import { Engenheiro } from './professions/Engenheiro.js';
import { Escriba } from './professions/Escriba.js';
import { Ferreiro } from './professions/Ferreiro.js';
import { Herbalista } from './professions/Herbalista.js';
import { Joalheiro } from './professions/Joalheiro.js';
import { Oleiro } from './professions/Oleiro.js';
import { Pedreiro } from './professions/Pedreiro.js';
import { Sicario } from './professions/Sicario.js';
import { Tecelao } from './professions/Tecelao.js';

// Importação de Treinamento
import { prepareTrainingData, registerTrainingListeners } from './training.js';

// Registro Central de Profissões
const professions = {
    "Alquimista": Alquimista,
    "Carpinteiro": Carpinteiro,
    "Cartógrafo": Cartografo,
    "Cozinheiro": Cozinheiro,
    "Coureiro": Coureiro,
    "Engenheiro": Engenheiro,
    "Escriba": Escriba,
    "Ferreiro": Ferreiro,
    "Herbalista": Herbalista,
    "Joalheiro": Joalheiro,
    "Oleiro": Oleiro,
    "Pedreiro": Pedreiro,
    "Sicário": Sicario,
    "Tecelão": Tecelao
};

const ICONES_PROFISSAO = {
    "Alquimista": "fa-flask", "Carpinteiro": "fa-tree", "Cartógrafo": "fa-map",
    "Cozinheiro": "fa-utensils", "Coureiro": "fa-vest", "Engenheiro": "fa-cog",
    "Escriba": "fa-feather", "Ferreiro": "fa-hammer", "Herbalista": "fa-leaf",
    "Joalheiro": "fa-gem", "Oleiro": "fa-wine-bottle", "Pedreiro": "fa-monument",
    "Sicário": "fa-skull-crossbones", "Tecelão": "fa-mitten"
};

// Variável global de controle de aba ativa
let tabParaManter = null;

Hooks.once("init", () => {
    console.log("Profissões Dinâmicas | Inicializando sistema...");
});

const CHARACTER_SHEET_HOOKS = [
    "renderActorSheet5eCharacter",
    "renderActorSheet5eCharacter2",
    "renderTidy5eCharacterSheet",
    "renderTidy5eSheet",
    "renderActorSheet"
];

async function prepareProfessionsRenderData(actor) {
    if (!actor) return { profissoesAtivas: [], todasProfissoes: Object.keys(PROFISSOES_CONFIG) };

    // 1. CARREGAR DADOS BÁSICOS
    let cookParams = actor.getFlag("professions-reworked-5e", "cookParams") || {};
    const defaultCook = { atributoPadrao: "wis", usoVantagem: false, usoDesvantagem: false, bonusSituacional: "" };
    cookParams = foundry.utils.mergeObject(defaultCook, cookParams);

    let profissoesAtivas = actor.getFlag("professions-reworked-5e", "profissoesAtivas") || [];
    let listaProjetos = actor.getFlag("professions-reworked-5e", "projetos") || [];
    let colapsos = actor.getFlag("professions-reworked-5e", "colapsos") || {};
    let ferramentasEquipadas = actor.getFlag("professions-reworked-5e", "ferramentasEquipadas") || {};
    let refeicoesProntas = actor.getFlag("professions-reworked-5e", "refeicoesProntas") || [];
    let listaTreinamentos = actor.getFlag("professions-reworked-5e", "listaTreinamentos") || [];

    const listaAtributos = Object.entries(ATRIBUTOS).map(([k, v]) => ({ value: k, label: v }));

    const profissoesRender = profissoesAtivas.map(pName => {
        const config = PROFISSOES_CONFIG[pName];
        const baseTool = config ? config.ferramenta : "";
        const ferramentasNoInventario = actor.items
            .filter(i => i.type === "tool" && i.system.type.baseItem === baseTool)
            .map(i => ({ id: i.id, name: i.name, selected: ferramentasEquipadas[pName] === i.id }));

        const treinoAtivo = listaTreinamentos.find(t => 
            t.categoria === "Profissão" && 
            t.profissaoAlvo === pName && 
            t.acertosAtuais < t.totalNecessario
        );

        const refeicoesProcessadas = (pName === "Cozinheiro") ? refeicoesProntas.map((ref, idx) => {
            const isCronologiaValida = treinoAtivo && ref.timestamp && (ref.timestamp > (treinoAtivo.timestamp || 0));
            return {
                ...ref,
                _index: idx,
                podeGanharXP: (isCronologiaValida && !ref.xpColetado)
            };
        }) : [];

        const projetosFiltrados = listaProjetos
            .map((proj, index) => ({ ...proj, _index: index }))
            .filter(proj => proj.profissao === pName)
            .map(proj => {
                const comp = COMPLEXIDADE_PROJETO[proj.complexidade];
                let infoExtra = "";
                let exibirValor = false;
                let isQuebrada = false;
                let totalNecessario = comp ? comp.acertosNecessarios : 0;
                let isColeta = (proj.subTipo === "Coleta de Veneno de Monstro");
                let resultadoColeta = proj.resultadoColeta || null;
                let isRascunho = false;
                let isDesenhoDefinitivo = false;
                let isHerbalista = (proj.profissao === "Herbalista");
                let listaBiomasDinamica = [];

                let extraOverrides = {};
                const profModule = professions[pName];
                if (profModule && typeof profModule.prepareProject === "function") {
                    const overrides = profModule.prepareProject(proj, comp, { actor });
                    if (overrides) {
                        if (overrides.infoExtra !== undefined) infoExtra = overrides.infoExtra;
                        if (overrides.exibirValor !== undefined) exibirValor = overrides.exibirValor;
                        if (overrides.isQuebrada !== undefined) isQuebrada = overrides.isQuebrada;
                        if (overrides.totalNecessario !== undefined) totalNecessario = overrides.totalNecessario;
                        if (overrides.isRascunho !== undefined) isRascunho = overrides.isRascunho;
                        if (overrides.isDesenhoDefinitivo !== undefined) isDesenhoDefinitivo = overrides.isDesenhoDefinitivo;
                        if (overrides.listaBiomas !== undefined) listaBiomasDinamica = overrides.listaBiomas;
                        extraOverrides = overrides;
                    }
                }

                if (!proj.atributoPadrao) proj.atributoPadrao = "int";

                let isConcluido = proj.isConcluido || false;
                if (!isConcluido && proj.subTipo !== "Desenho de Mapa" && !isRascunho && !isColeta && proj.acertosAtuais >= totalNecessario) {
                    isConcluido = true;
                }

                let podeGanharXP = false;
                const momentoConclusao = proj.dataConclusao || 0;
                const momentoInicioTreino = treinoAtivo ? (treinoAtivo.timestamp || 0) : 0;
                const isCronologiaValida = treinoAtivo && momentoConclusao > momentoInicioTreino;

                if (isConcluido && !proj.xpColetado && isCronologiaValida) {
                    if (isColeta && proj.subTipo === "Coleta de Veneno de Monstro") {
                        if (proj.resultadoColeta && !proj.resultadoColeta.includes("Nenhuma dose")) {
                            podeGanharXP = true;
                        }
                    } else {
                        podeGanharXP = true;
                    }
                }

                let podeReceberItem = isConcluido && !isRascunho && !proj.itemColetado && proj.subTipo !== "Conserto";

                return {
                    ...proj,
                    atributosLocais: listaAtributos,
                    infoExtra: infoExtra,
                    totalNecessario: totalNecessario,
                    porcentagem: isColeta ? 0 : (totalNecessario > 0 ? Math.min((proj.acertosAtuais / totalNecessario) * 100, 100) : 0),
                    exibirValor: exibirValor,
                    isQuebrada: isQuebrada,
                    isConcluido: isConcluido,
                    isColeta: isColeta,
                    resultadoColeta: resultadoColeta,
                    isRascunho: isRascunho,
                    isDesenhoDefinitivo: isDesenhoDefinitivo,
                    isHerbalista: isHerbalista,
                    listaBiomas: listaBiomasDinamica,
                    usoDesvantagem: proj.usoDesvantagem || false,
                    podeGanharXP: podeGanharXP,
                    podeReceberItem: podeReceberItem,
                    podeConcluir: extraOverrides.podeConcluir
                };
            });

        return {
            nome: pName,
            icon: ICONES_PROFISSAO[pName] || "fa-briefcase",
            isCozinheiro: pName === "Cozinheiro",
            isCollapsed: colapsos[pName] || false,
            cookParams: cookParams,
            refeicoes: refeicoesProcessadas,
            atributosLocais: listaAtributos,
            subTipos: config ? config.subTipos : [],
            ferramentasDisponiveis: ferramentasNoInventario,
            projetos: projetosFiltrados
        };
    });

    return {
        profissoesAtivas: profissoesRender,
        todasProfissoes: Object.keys(PROFISSOES_CONFIG)
    };
}

function salvarScroll(actor, $container) {
    if (!actor || !$container || !$container.length) return;
    let pos = 0;
    const candidatos = $container.find('.professions-tab, .training-tab, .tidy-sheet-body, .sheet-body, .scroll-container, section.tab-body, form, .window-content');
    candidatos.each((i, el) => {
        if (el.scrollTop > 0) {
            pos = el.scrollTop;
            return false;
        }
    });
    if (pos > 0) {
        actor._professionsScrollPos = pos;
    }
}

function restaurarScroll(actor, $container) {
    if (!actor || typeof actor._professionsScrollPos !== "number" || actor._professionsScrollPos <= 0) return;
    const pos = actor._professionsScrollPos;
    const aplicar = () => {
        const alvos = $container.find('.professions-tab, .training-tab, .tidy-sheet-body, .sheet-body, .scroll-container, section.tab-body, form, .window-content');
        alvos.each((i, el) => {
            el.scrollTop = pos;
        });
    };
    aplicar();
    requestAnimationFrame(aplicar);
    setTimeout(aplicar, 40);
}

function attachProfessionsTabListeners(app, $html, data, salvarScrollFn = null) {
    const actor = app?.actor || data?.actor;
    if (!actor) return;

    const salvarScrollBound = () => {
        salvarScroll(actor, $html);
        if (typeof salvarScrollFn === "function") salvarScrollFn();
    };

    let profissoesAtivas = actor.getFlag("professions-reworked-5e", "profissoesAtivas") || [];
    let listaProjetos = actor.getFlag("professions-reworked-5e", "projetos") || [];
    let colapsos = actor.getFlag("professions-reworked-5e", "colapsos") || {};
    let ferramentasEquipadas = actor.getFlag("professions-reworked-5e", "ferramentasEquipadas") || {};
    let listaTreinamentos = actor.getFlag("professions-reworked-5e", "listaTreinamentos") || [];

    // Mudança de Bioma no Card
    $html.find('.card-biome-select').off('change.professions').on('change.professions', async (ev) => {
        salvarScrollBound();
        const card = ev.currentTarget.closest('.project-card');
        const index = card.dataset.index;
        const novoBioma = ev.currentTarget.value;
        if (listaProjetos[index]) {
            listaProjetos[index].bioma = novoBioma;
            const profModule = professions[listaProjetos[index].profissao];
            if (profModule && typeof profModule.onBiomeChange === "function") {
                profModule.onBiomeChange(listaProjetos[index], novoBioma, actor);
            }
            await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
        }
    });

    // Aprender nova profissão
    $html.find('.add-profession-btn').off('click.professions').on('click.professions', async (ev) => {
        salvarScrollBound();
        const novaProf = $html.find('.select-new-profession').val();
        if (!profissoesAtivas.includes(novaProf)) {
            profissoesAtivas.push(novaProf);
            await actor.setFlag("professions-reworked-5e", "profissoesAtivas", profissoesAtivas);
        }
    });

    // Esquecer profissão
    $html.find('.remove-profession').off('click.professions').on('click.professions', async (ev) => {
        ev.stopPropagation();
        salvarScrollBound();
        const profName = ev.currentTarget.closest('.profession-section').dataset.prof;
        const confirm = await Dialog.confirm({ title: "Remover", content: `<p>Esquecer a profissão <strong>${profName}</strong>?</p>` });
        if (confirm) {
            profissoesAtivas = profissoesAtivas.filter(p => p !== profName);
            await actor.setFlag("professions-reworked-5e", "profissoesAtivas", profissoesAtivas);
        }
    });

    // Collapse Profissão
    $html.find('.prof-header').off('click.professions').on('click.professions', async (ev) => {
        if ($(ev.target).closest('.remove-profession, select, option, button').length) return;
        salvarScrollBound();
        const profName = ev.currentTarget.closest('.profession-section').dataset.prof;
        colapsos[profName] = !colapsos[profName];
        await actor.setFlag("professions-reworked-5e", "colapsos", colapsos);
    });

    // Deletar Projeto
    $html.find('.delete-project').off('click.professions').on('click.professions', async (ev) => {
        salvarScrollBound();
        const card = ev.currentTarget.closest('.project-card');
        const index = card.dataset.index;
        if (listaProjetos[index]) {
            const confirm = await Dialog.confirm({ title: "Excluir", content: `<p>Excluir o projeto <strong>${listaProjetos[index].nome}</strong>?</p>` });
            if (confirm) {
                listaProjetos.splice(index, 1);
                await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
            }
        }
    });

    // Renomear Projeto
    $html.find('.edit-project-name').off('click.professions').on('click.professions', async (ev) => {
        ev.stopPropagation();
        salvarScrollBound();
        const card = ev.currentTarget.closest('.project-card');
        const index = card.dataset.index;
        const projeto = listaProjetos[index];

        if (projeto) {
            new Dialog({
                title: "Renomear Projeto",
                content: `<form><div class="form-group"><label>Novo Nome:</label><input type="text" name="novoNome" value="${projeto.nome}" autofocus></div></form>`,
                buttons: {
                    salvar: {
                        label: "Salvar",
                        icon: '<i class="fas fa-check"></i>',
                        callback: async (htmlDlg) => {
                            const novoNome = $(htmlDlg).find('[name="novoNome"]').val();
                            if (novoNome && novoNome.trim() !== "") {
                                listaProjetos[index].nome = novoNome.trim();
                                await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
                            }
                        }
                    },
                    cancelar: {
                        label: "Cancelar",
                        icon: '<i class="fas fa-times"></i>'
                    }
                },
                default: "salvar"
            }).render(true);
        }
    });

    // Configurações do Card de Projeto
    $html.find('.roll-attribute').off('change.professions').on('change.professions', async (ev) => {
        salvarScrollBound();
        const card = ev.currentTarget.closest('.project-card');
        const index = card.dataset.index;
        if (listaProjetos[index]) {
            listaProjetos[index].atributoPadrao = ev.currentTarget.value;
            await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
        }
    });

    $html.find('.adv-checkbox').off('change.professions').on('change.professions', async (ev) => {
        salvarScrollBound();
        const card = ev.currentTarget.closest('.project-card');
        const index = card.dataset.index;
        if (listaProjetos[index]) {
            listaProjetos[index].usoVantagem = ev.currentTarget.checked;
            await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
        }
    });

    $html.find('.disadv-checkbox').off('change.professions').on('change.professions', async (ev) => {
        salvarScrollBound();
        const card = ev.currentTarget.closest('.project-card');
        const index = card.dataset.index;
        if (listaProjetos[index]) {
            listaProjetos[index].usoDesvantagem = ev.currentTarget.checked;
            await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
        }
    });

    $html.find('.roll-bonus').off('change.professions').on('change.professions', async (ev) => {
        salvarScrollBound();
        const card = ev.currentTarget.closest('.project-card');
        const index = card.dataset.index;
        if (listaProjetos[index]) {
            listaProjetos[index].bonusSituacional = ev.currentTarget.value;
            await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
        }
    });

    // Equipar Ferramenta
    $html.find('.profession-tool-select').off('change.professions').on('change.professions', async (ev) => {
        salvarScrollBound();
        const profName = ev.currentTarget.closest('.profession-section').dataset.prof;
        ferramentasEquipadas[profName] = ev.currentTarget.value;
        await actor.setFlag("professions-reworked-5e", "ferramentasEquipadas", ferramentasEquipadas);
    });

    // Mudar Subtipo ao Criar Projeto
    $html.find('.new-project-subtype').off('change.professions').on('change.professions', ev => {
        const container = $(ev.currentTarget).closest('.project-creation-form');
        const profSection = container.closest('.profession-section');
        const profName = profSection.data('prof');
        const profModule = professions[profName];

        if (profModule && typeof profModule.atualizarDropdown === "function") {
            profModule.atualizarDropdown(container);
        }
    });

    // Criar Novo Projeto
    $html.find('.create-project-btn').off('click.professions').on('click.professions', async (ev) => {
        salvarScrollBound();
        const container = $(ev.currentTarget).closest('.project-creation-form');
        const profSection = container.closest('.profession-section');
        const profName = profSection.data('prof');
        
        const nomeInput = container.find('.new-project-name').val();
        const nome = (nomeInput && nomeInput.trim() !== "") ? nomeInput.trim() : `Novo Projeto de ${profName}`;
        const subTipo = container.find('.new-project-subtype').val();
        const valorComplexidade = container.find('.new-project-complexity').val();

        let projectData = {
            profissao: profName,
            nome: nome,
            subTipo: subTipo,
            complexidade: valorComplexidade,
            acertosAtuais: 0,
            atributoPadrao: "int",
            usoVantagem: false,
            usoDesvantagem: false,
            bonusSituacional: ""
        };

        const profModule = professions[profName];
        if (profModule && typeof profModule.onCreateProject === "function") {
            const res = profModule.onCreateProject(projectData, container, { actor });
            if (res === false) return;
        }

        listaProjetos.push(projectData);
        await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
    });

    // Rolar Teste de Profissão
    $html.find('.roll-profession-test').off('click.professions').on('click.professions', async (ev) => {
        salvarScrollBound();
        const card = ev.currentTarget.closest('.project-card');
        const index = card.dataset.index;
        const projeto = listaProjetos[index];

        if (!projeto) return;

        const profName = projeto.profissao;
        const configProf = PROFISSOES_CONFIG[profName];
        const baseTool = configProf ? configProf.ferramenta : "";
        const toolItemId = ferramentasEquipadas[profName];
        const toolItem = actor.items.get(toolItemId);

        if (!toolItem || toolItem.type !== "tool" || toolItem.system.type.baseItem !== baseTool) {
            ui.notifications.warn(`Selecione uma ferramenta válida de ${profName} equipada no painel!`);
            return;
        }

        const attrKey = projeto.atributoPadrao || "int";
        const attrMod = actor.system.abilities[attrKey].mod;
        const attrLabel = ATRIBUTOS[attrKey];
        const toolProf = toolItem.system.prof?.hasProficiency ? (toolItem.system.prof.flat || (actor.system.attributes.prof * (toolItem.system.prof.multiplier || 1))) : 0;
        const toolName = toolItem.name;

        const hasAdv = projeto.usoVantagem || false;
        const hasDis = projeto.usoDesvantagem || false;
        const bonusSit = projeto.bonusSituacional || "";

        let diceFormula = "1d20";
        if (hasAdv && !hasDis) diceFormula = "2d20kh1";
        else if (!hasAdv && hasDis) diceFormula = "2d20kl1";

        let formula = `${diceFormula} + ${attrMod}[${attrLabel}] + ${toolProf}[${toolName}]`;
        if (bonusSit) formula += ` + ${bonusSit}[Sit]`;

        try {
            const r = new Roll(formula, actor.getRollData());
            await r.evaluate();

            let diffAlvo = "Médio";
            if (projeto.dificuldadeEspecifica) {
                diffAlvo = projeto.dificuldadeEspecifica;
            } else {
                const compConfig = COMPLEXIDADE_PROJETO[projeto.complexidade];
                diffAlvo = compConfig ? compConfig.dificuldade : "Médio";
            }

            const res = calcularResultado(r.total, diffAlvo);
            
            let mudou = false;
            const profModule = professions[profName];
            if (profModule && typeof profModule.onRollResult === "function") {
                mudou = profModule.onRollResult(projeto, res, { actor });
            } else {
                projeto.acertosAtuais += res.acertos;
                const compConfig = COMPLEXIDADE_PROJETO[projeto.complexidade];
                const totalReq = compConfig ? compConfig.acertosNecessarios : 0;

                if (projeto.acertosAtuais >= totalReq) {
                    projeto.isConcluido = true;
                    if (!projeto.dataConclusao) projeto.dataConclusao = Date.now();
                }
                mudou = true;
            }

            const cfg = RESULTADO_FORMAT[res.resultado] || { label: res.resultado, color: "black", bg: "#eee", border: "#ccc" };
            let textAcertos = res.acertos === 1 ? "+1 Acerto" : `+${res.acertos} Acertos`;
            if (res.acertos === 0) textAcertos = "0 Acertos";
            if (res.acertos < 0) textAcertos = `${res.acertos} Acertos`;

            const contentHTML = `
                <div style="border: 2px solid ${cfg.border}; background-color: ${cfg.bg}; padding: 8px; text-align: center; color: black; border-radius: 5px; font-family: 'Signika', sans-serif;">
                    <h3 style="color: ${cfg.color}; border-bottom: 1px solid ${cfg.border}; margin: 0 0 5px 0; font-weight: bold;">
                        ${cfg.label}
                    </h3>
                    <div style="font-size: 12px; margin-bottom: 5px; color: #444;">
                        <strong>${projeto.nome}</strong> (${profName})<br>
                        (Dificuldade: ${diffAlvo})
                    </div>
                    <div style="font-size: 14px; font-weight: bold; color: ${cfg.color}; margin-top: 5px;">
                        ${cfg.label} <span style="font-size: 12px; color: #555;">(${textAcertos})</span>
                    </div>
                </div>
            `;

            if (mudou) {
                await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
            }

            r.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                flavor: contentHTML
            });

        } catch (err) {
            ui.notifications.error("Erro na rolagem: " + err.message);
        }
    });

    // Resgatar Recompensa no Inventário
    $html.find('.get-reward-btn').not('.get-meal-reward-btn').off('click.professions').on('click.professions', async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        salvarScrollBound(); 
        const scrollSalvo = app._scrollInfo;
        
        const card = ev.currentTarget.closest('.project-card');
        const index = card.dataset.index;
        const projeto = listaProjetos[index];

        if (!projeto) return;

        let itemKey = projeto.subTipo;
        if (projeto.tipoArma) {
            itemKey = projeto.tipoArma.includes("Arma") ? projeto.tipoArma : `Arma ${projeto.tipoArma}`;
        } else if (projeto.tipoArmadura) {
            itemKey = projeto.tipoArmadura.includes(" (Placas)") ? "Armadura Pesada" : projeto.tipoArmadura;
        } else if (projeto.tipoVenenoColeta) {
            itemKey = projeto.tipoVenenoColeta;
        } else if (projeto.tipoErva) {
            itemKey = projeto.tipoErva;
        } else if (projeto.raridade) {
            itemKey = `${projeto.subTipo} ${projeto.raridade}`;
        }

        const categoriaItem = RECOMPENSAS[projeto.profissao];
        let configItem = categoriaItem ? (categoriaItem[itemKey] || categoriaItem[projeto.subTipo]) : null;

        if (!configItem) {
            const warningKey = itemKey !== projeto.subTipo ? `${projeto.subTipo} (${itemKey})` : itemKey;
            ui.notifications.warn(`Recompensa para "${warningKey}" não configurada no repositório do ${projeto.profissao}.`);
            return;
        }

        await abrirDialogoRecompensa(actor, projeto, configItem, async (selectedOpt) => {
            projeto.itemColetado = true;
            tabParaManter = "professions";
            app._scrollInfo = scrollSalvo;
            await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
        }, app, scrollSalvo);
    });

    // Adicionar XP de Projeto
    $html.find('.add-xp-btn').not('.xp-meal-btn').off('click.professions').on('click.professions', async (ev) => {
        ev.stopPropagation();
        salvarScrollBound();
        const card = ev.currentTarget.closest('.project-card');
        const index = card.dataset.index;
        const projeto = listaProjetos[index];

        if (!projeto) return;

        const treinoIndex = listaTreinamentos.findIndex(t => 
            t.categoria === "Profissão" && 
            t.profissaoAlvo === projeto.profissao && 
            t.acertosAtuais < t.totalNecessario
        );

        if (treinoIndex === -1) {
            ui.notifications.warn("Nenhum treinamento ativo encontrado para esta profissão.");
            return;
        }

        const treino = listaTreinamentos[treinoIndex];
        let xpAmount = 0;

        if (projeto.subTipo === "Coleta de Veneno de Monstro") {
            const toolItem = actor.items.find(i => i.type === "tool" && i.system.type.baseItem === "poison");
            const isProf = (toolItem && toolItem.system.prof?.multiplier >= 1) ? "proficiente" : "sem_proficiencia";
            const tipoVeneno = projeto.tipoVenenoColeta; 
            xpAmount = XP_VENENO_COLETA[isProf][tipoVeneno] || 0;
        } else {
            xpAmount = projeto.acertosAtuais;
        }

        treino.acertosAtuais = Math.min(treino.acertosAtuais + xpAmount, treino.totalNecessario);
        projeto.xpColetado = true;

        const contentHTML = `
            <div style="border: 2px solid #b8860b; background-color: #fff8e1; padding: 8px; border-radius: 5px; font-family: 'Signika', sans-serif; color: black;">
                <h3 style="color: #b8860b; border-bottom: 1px solid #b8860b; margin: 0 0 5px 0; text-align: center; font-weight: bold;">
                    Treinamento de ${treino.profissaoAlvo}
                </h3>
                <div style="font-size: 13px; line-height: 1.4; margin-bottom: 5px;">
                    <strong>Jogador:</strong> ${actor.name}<br>
                    <strong>Projeto concluído:</strong> ${projeto.nome}
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
            "flags.professions-reworked-5e.projetos": listaProjetos,
            "flags.professions-reworked-5e.listaTreinamentos": listaTreinamentos
        });
    });

    // Delegar listeners específicos de cada profissão
    for (const [pName, profModule] of Object.entries(professions)) {
        if (profModule && typeof profModule.registerListeners === "function") {
            profModule.registerListeners($html, actor, { salvarScroll: salvarScrollBound, tabParaManter, app });
        }
    }

    // Registrar listeners de Treinamento
    registerTrainingListeners($html, actor, { salvarScroll: salvarScrollBound, tabParaManter });
}

let tidyTabsRegistered = false;
function registerTidy5eTabs(api) {
    if (!api || tidyTabsRegistered) return;
    tidyTabsRegistered = true;

    try {
        if (api.models?.HandlebarsTab) {
            api.registerCharacterTab(
                new api.models.HandlebarsTab({
                    tabId: "professions",
                    title: "Profissões",
                    icon: "fas fa-hammer",
                    path: "modules/professions-reworked-5e/templates/professions-tab.hbs",
                    getData: async (context) => {
                        return await prepareProfessionsRenderData(context.actor);
                    },
                    onRender: (params) => {
                        const $element = $(params.element);
                        const actor = params.app?.actor || params.data?.actor;
                        attachProfessionsTabListeners(params.app, $element, params.data, () => salvarScroll(actor, $element));
                        restaurarScroll(actor, $element);
                    }
                })
            );

            api.registerCharacterTab(
                new api.models.HandlebarsTab({
                    tabId: "training",
                    title: "Treinamento",
                    icon: "fas fa-graduation-cap",
                    path: "modules/professions-reworked-5e/templates/training-tab.hbs",
                    getData: async (context) => {
                        const trainingData = prepareTrainingData(context.actor);
                        return {
                            ...trainingData,
                            opcoesTreino: Object.keys(TREINAMENTO_CONFIG),
                        };
                    },
                    onRender: (params) => {
                        const $element = $(params.element);
                        const actor = params.app?.actor || params.data?.actor;
                        attachProfessionsTabListeners(params.app, $element, params.data, () => salvarScroll(actor, $element));
                        restaurarScroll(actor, $element);
                    }
                })
            );
            console.log("Profissões Dinâmicas | Abas registradas com sucesso no Tidy 5e Sheet API!");
        }
    } catch (err) {
        console.error("Profissões Dinâmicas | Erro ao registrar no Tidy 5e Sheet API:", err);
    }
}

Hooks.once("tidy5e-sheet.ready", (api) => {
    registerTidy5eTabs(api);
});

Hooks.once("ready", () => {
    const tidyApi = game.modules.get("tidy5e-sheet")?.api;
    if (tidyApi) {
        registerTidy5eTabs(tidyApi);
    }
});

async function renderProfessionsTabSystem(app, htmlInput, data) {
    if (!app?.actor || app.actor.type !== "character") return;

    let rootEl = htmlInput;
    if (Array.isArray(htmlInput)) rootEl = htmlInput[0];
    if (rootEl instanceof jQuery) rootEl = rootEl[0];
    if (!rootEl && app.element) rootEl = app.element;
    if (Array.isArray(rootEl)) rootEl = rootEl[0];
    if (rootEl instanceof jQuery) rootEl = rootEl[0];

    let $container = $(rootEl || app.element);
    if (app.element) {
        const appEl = app.element instanceof jQuery ? app.element[0] : (Array.isArray(app.element) ? app.element[0] : app.element);
        if (appEl) $container = $(appEl);
    }

    if (!$container || !$container.length) return;

    const actor = app.actor;

    const profData = await prepareProfessionsRenderData(actor);
    const trainingData = prepareTrainingData(actor);

    const templatePath = "modules/professions-reworked-5e/templates/professions-tab.hbs";
    const myTabHtml = await renderTemplate(templatePath, profData);

    const trainingTemplatePath = "modules/professions-reworked-5e/templates/training-tab.hbs";
    const trainingHtml = await renderTemplate(trainingTemplatePath, {
        ...trainingData,
        opcoesTreino: Object.keys(TREINAMENTO_CONFIG),
    });

    let $nav = $container.find('.sheet-navigation.tabs, nav.sheet-navigation, nav.tabs, [data-group="primary"].tabs, [data-group="primary"], .tidy-tabs, [role="tablist"], .tabs').first();
    if (!$nav.length) {
        $nav = $container.find('nav').first();
    }

    let $sheetBody = $container.find('.sheet-body, .sheet-content, section.tab-body, .tidy-sheet-body, main, [data-group="primary"].tab-content, .tab-content').first();
    if (!$sheetBody.length) {
        $sheetBody = $container.find('form').first();
    }

    if ($nav.length && $nav.find('[data-tab="professions"]').length === 0) {
        $nav.append($('<a class="item" data-tab="professions" data-group="primary" role="tab" title="Profissões"><i class="fas fa-hammer"></i> Profissões</a>'));
    }
    if ($nav.length && $nav.find('[data-tab="training"]').length === 0) {
        $nav.append($('<a class="item" data-tab="training" data-group="primary" role="tab" title="Treinamento"><i class="fas fa-graduation-cap"></i> Treinamento</a>'));
    }

    $container.find('.professions-tab').remove();
    $container.find('.training-tab').remove();

    const $profTabHtml = $(myTabHtml);
    const $trainTabHtml = $(trainingHtml);

    $sheetBody.append($profTabHtml);
    $sheetBody.append($trainTabHtml);

    const activateCustomTab = (tabName) => {
        $nav.find('[data-tab]').removeClass('active');
        $nav.find(`[data-tab="${tabName}"]`).addClass('active');

        $sheetBody.find('.tab, section.tab-body .tab, .tab-content .tab').removeClass('active').hide();
        if (tabName === "professions") {
            $profTabHtml.addClass('active').show();
        } else if (tabName === "training") {
            $trainTabHtml.addClass('active').show();
        }
        tabParaManter = tabName;
    };

    $nav.find('[data-tab="professions"]').off('click.professions').on('click.professions', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        activateCustomTab("professions");
    });

    $nav.find('[data-tab="training"]').off('click.professions').on('click.professions', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        activateCustomTab("training");
    });

    $nav.find('[data-tab]').not('[data-tab="professions"]').not('[data-tab="training"]').off('click.professionsOther').on('click.professionsOther', () => {
        $profTabHtml.removeClass('active').hide();
        $trainTabHtml.removeClass('active').hide();
    });

    $container.find('.profession-section').each((i, el) => {
        const prof = $(el).data('prof');
        const form = $(el).find('.project-creation-form');
        const profModule = professions[prof];
        if (profModule && typeof profModule.atualizarDropdown === "function") {
            profModule.atualizarDropdown(form);
        }
    });

    attachProfessionsTabListeners(app, $container, data, () => salvarScroll(actor, $container));
    restaurarScroll(actor, $container);

    if (tabParaManter === "professions" || tabParaManter === "training") {
        activateCustomTab(tabParaManter);
        tabParaManter = null;
    } else if (app._tabs && app._tabs[0] && typeof app._tabs[0].activate === "function") {
        try {
            const activeTab = app._tabs[0].active;
            if (activeTab === "professions" || activeTab === "training") {
                activateCustomTab(activeTab);
            }
        } catch (e) {}
    }
}

CHARACTER_SHEET_HOOKS.forEach(hookName => {
    Hooks.on(hookName, (app, html, data) => {
        renderProfessionsTabSystem(app, html, data);
    });
});

export async function abrirDialogoRecompensa(actor, projeto, configItem, onConcluidoCallback, app = null, scrollSalvo = null) {
    const processarEntrega = async (nomeFinalItem, sourcePack, quantity = null) => {
        try {
            const pack = game.packs.get(sourcePack);
            if (!pack) throw new Error(`Compêndio ${sourcePack} não encontrado.`);
            
            const indexPack = await pack.getIndex();
            const entry = indexPack.find(i => i.name === nomeFinalItem);
            if (!entry) throw new Error(`Item "${nomeFinalItem}" não encontrado no compêndio ${sourcePack}.`);

            const itemDoc = await pack.getDocument(entry._id);
            const itemData = itemDoc.toObject();
            
            if (quantity !== null && quantity !== undefined) {
                if (!itemData.system) itemData.system = {};
                itemData.system.quantity = quantity;
            }
            
            if (app) {
                tabParaManter = "professions";
                app._scrollInfo = scrollSalvo;
            }
            await actor.createEmbeddedDocuments("Item", [itemData]);

            if (onConcluidoCallback) await onConcluidoCallback({ name: nomeFinalItem, source: "compendium" });

            const contentHTML = `
                <div style="border: 2px solid #2e8b57; background-color: #e8f5e9; padding: 8px; border-radius: 5px; font-family: 'Signika', sans-serif; color: black;">
                    <h3 style="color: #2e8b57; border-bottom: 1px solid #2e8b57; margin: 0 0 5px 0; text-align: center; font-weight: bold;">
                        Projeto Finalizado
                    </h3>
                    <div style="font-size: 13px; line-height: 1.4; margin-bottom: 5px;">
                        <strong>Artesão:</strong> ${actor.name}<br>
                        <strong>Projeto:</strong> ${projeto.nome}<br>
                        <strong>Item Obtido:</strong> ${nomeFinalItem}
                    </div>
                    <div style="font-size: 14px; font-weight: bold; color: #2e8b57; text-align: center; margin-top: 5px;">
                        <i class="fas fa-box-open"></i> Recompensa resgatada!
                    </div>
                </div>
            `;

            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor }),
                content: contentHTML
            });

        } catch (err) {
            ui.notifications.error("Erro ao gerar recompensa: " + err.message);
        }
    };

    // Sempre abrir a janela de diálogo de recompensa, mesmo se houver apenas um item (normaliza compendium/manual para lista)
    let normalizedConfig = configItem;
    if (configItem.source !== "list") {
        normalizedConfig = {
            source: "list",
            pack: configItem.pack,
            options: [ configItem ]
        };
    }

    // Resolver as opções em objetos completos (ícone, descrição, preço, etc.)
    const resolvedOptions = [];
    const packNames = new Set();
    if (normalizedConfig.pack) packNames.add(normalizedConfig.pack);
    
    for (const opt of normalizedConfig.options) {
        if (typeof opt === "object" && opt.source === "compendium" && opt.pack) {
            packNames.add(opt.pack);
        }
    }

    // Buscar os indices de todos os compêndios necessários
    const indices = {};
    for (const packName of packNames) {
        try {
            const pack = game.packs.get(packName);
            if (pack) {
                indices[packName] = await pack.getIndex({ fields: ["img", "system.description.value", "system.price", "system.weight"] });
            }
        } catch (e) {
            console.error(`Profissões Dinâmicas | Erro ao indexar compêndio ${packName}:`, e);
        }
    }

    for (let i = 0; i < normalizedConfig.options.length; i++) {
        const opt = normalizedConfig.options[i];
        let itemData = null;

        if (typeof opt === "string") {
            const packName = normalizedConfig.pack || "dnd5e.items";
            const packIdx = indices[packName];
            const entry = packIdx ? packIdx.find(e => e.name === opt) : null;
            if (entry) {
                itemData = {
                    id: `opt-${i}`,
                    name: opt,
                    img: entry.img || "icons/svg/item-bag.svg",
                    description: entry.system?.description?.value || "<p>Sem descrição disponível.</p>",
                    weight: entry.system?.weight?.value || entry.system?.weight || 0,
                    price: entry.system?.price ? `${entry.system.price.value || 0} ${entry.system.price.denomination || "gp"}` : "0 gp",
                    source: "compendium",
                    pack: packName,
                    quantity: null
                };
            } else {
                itemData = {
                    id: `opt-${i}`,
                    name: opt,
                    img: "icons/svg/item-bag.svg",
                    description: "<p>Item não encontrado no compêndio.</p>",
                    weight: 0,
                    price: "N/A",
                    source: "compendium",
                    pack: packName,
                    quantity: null
                };
            }
        } else if (typeof opt === "object") {
            if (opt.source === "compendium") {
                const packName = opt.pack || "dnd5e.items";
                const packIdx = indices[packName];
                const entry = packIdx ? packIdx.find(e => e.name === opt.name) : null;
                if (entry) {
                    itemData = {
                        id: `opt-${i}`,
                        name: opt.name,
                        img: entry.img || "icons/svg/item-bag.svg",
                        description: entry.system?.description?.value || "<p>Sem descrição disponível.</p>",
                        weight: entry.system?.weight?.value || entry.system?.weight || 0,
                        price: entry.system?.price ? `${entry.system.price.value || 0} ${entry.system.price.denomination || "gp"}` : "0 gp",
                        source: "compendium",
                        pack: packName,
                        quantity: opt.quantity || null
                    };
                } else {
                    itemData = {
                        id: `opt-${i}`,
                        name: opt.name,
                        img: "icons/svg/item-bag.svg",
                        description: "<p>Item não encontrado no compêndio.</p>",
                        weight: 0,
                        price: "N/A",
                        source: "compendium",
                        pack: packName,
                        quantity: opt.quantity || null
                    };
                }
            } else if (opt.source === "manual") {
                let finalSystem = JSON.parse(JSON.stringify(opt.system || {}));
                
                if (projeto.subTipo === "Gema Lapidada" && projeto.valorAtual) {
                    finalSystem.price = { value: projeto.valorAtual, denomination: "cp" };
                }
                if (projeto.profissao === "Carpinteiro") {
                    if (projeto.subTipo === "Peça de Madeira") {
                        const precos = {
                            "Simples": 1,
                            "Moderadamente Complexo": 5,
                            "Complexo": 25,
                            "Muito Complexo": 100
                        };
                        finalSystem.price = { value: precos[projeto.complexidade] || 1, denomination: "gp" };
                    } else if (projeto.subTipo === "Preparo para Encantamento") {
                        const precos = {
                            "Comum": 10,
                            "Incomum": 50,
                            "Raro": 250,
                            "Muito Raro": 1000,
                            "Lendário": 5000
                        };
                        finalSystem.price = { value: precos[projeto.raridade] || 10, denomination: "gp" };
                    }
                }
                if (projeto.profissao === "Coureiro") {
                    if (projeto.subTipo === "Item de Couro") {
                        const precos = {
                            "Simples": 1,
                            "Moderadamente Complexo": 5,
                            "Complexo": 25,
                            "Muito Complexo": 100
                        };
                        finalSystem.price = { value: precos[projeto.complexidade] || 1, denomination: "gp" };
                    } else if (projeto.subTipo === "Preparo para Encantamento") {
                        const precos = {
                            "Comum": 10,
                            "Incomum": 50,
                            "Raro": 250,
                            "Muito Raro": 1000,
                            "Lendário": 5000
                        };
                        finalSystem.price = { value: precos[projeto.raridade] || 10, denomination: "gp" };
                    }
                }
                if (projeto.profissao === "Engenheiro") {
                    if (projeto.subTipo === "Mecanismo" || projeto.subTipo === "Mecanismo Improvisado" || projeto.subTipo === "Planos de Estruturas") {
                        const precos = {
                            "Simples": 1,
                            "Moderadamente Complexo": 5,
                            "Complexo": 25,
                            "Muito Complexo": 100
                        };
                        finalSystem.price = { value: precos[projeto.complexidade] || 1, denomination: "gp" };
                    } else if (projeto.subTipo === "Preparo para Encantamento") {
                        const precos = {
                            "Comum": 10,
                            "Incomum": 50,
                            "Raro": 250,
                            "Muito Raro": 1000,
                            "Lendário": 5000
                        };
                        finalSystem.price = { value: precos[projeto.raridade] || 10, denomination: "gp" };
                    }
                }
                if (projeto.profissao === "Escriba") {
                    if (projeto.subTipo === "Cópia de Texto" || projeto.subTipo === "Obra de Arte" || projeto.subTipo === "Escrita de Livro") {
                        const precos = {
                            "Simples": 1,
                            "Moderadamente Complexo": 5,
                            "Complexo": 25,
                            "Muito Complexo": 100
                        };
                        finalSystem.price = { value: precos[projeto.complexidade] || 1, denomination: "gp" };
                    }
                }

                let descriptionValue = finalSystem.description?.value || "<p>Sem descrição disponível.</p>";
                if (descriptionValue.includes("[value]") && projeto.resultado) {
                    const hpValue = projeto.resultado.match(/\d+/)?.[0] || "0";
                    descriptionValue = descriptionValue.replace("[value]", hpValue);
                }

                itemData = {
                    id: `opt-${i}`,
                    name: opt.name,
                    img: opt.img || "icons/svg/item-bag.svg",
                    description: descriptionValue,
                    weight: finalSystem.weight?.value || finalSystem.weight || 0,
                    price: finalSystem.price ? `${finalSystem.price.value || 0} ${finalSystem.price.denomination || "gp"}` : "0 gp",
                    source: "manual",
                    system: {
                        ...finalSystem,
                        description: { value: descriptionValue }
                    },
                    type: opt.type,
                    quantity: opt.quantity || null
                };
            }
        }

        if (itemData) resolvedOptions.push(itemData);
    }

    let selectedItemId = resolvedOptions.length === 1 ? resolvedOptions[0].id : null;

    const dialogContent = `
        <div class="reward-browser-container" style="display: flex; flex-direction: column; gap: 10px; font-family: 'Signika', sans-serif; height: 420px; overflow: hidden; margin-top: 5px;">
            <div class="reward-search-wrapper" style="display: flex; align-items: center; background: #fff; border: 1px solid #ccc; border-radius: 4px; padding: 4px 8px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                <i class="fas fa-search" style="color: #666; margin-right: 8px;"></i>
                <input type="text" id="reward-search-input" placeholder="Pesquisar item..." style="border: none; background: transparent; width: 100%; outline: none; box-shadow: none; height: 26px; font-size: 14px; color: #333;">
            </div>
            <div class="reward-split-body" style="display: flex; gap: 12px; height: calc(100% - 46px); min-height: 0;">
                <!-- Lista (Esquerda) -->
                <div class="reward-list-pane" style="flex: 1.1; border: 1px solid #ccc; border-radius: 4px; background: rgba(0,0,0,0.02); overflow-y: auto; display: flex; flex-direction: column; height: 350px;">
                    <div id="reward-items-list" style="display: flex; flex-direction: column;"></div>
                </div>
                <!-- Detalhes (Direita) -->
                <div class="reward-details-pane" id="reward-details-container" style="flex: 1.5; border: 1px solid #ccc; border-radius: 4px; background: #fff; padding: 12px; overflow-y: auto; color: #222; display: flex; flex-direction: column; gap: 10px; height: 350px; box-shadow: inset 0 0 5px rgba(0,0,0,0.05);">
                    <div style="text-align: center; color: #777; margin-top: 100px;">
                        <i class="fas fa-arrow-left" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                        Selecione um item da lista para visualizar os detalhes.
                    </div>
                </div>
            </div>
        </div>
    `;

    new Dialog({
        title: `Resgatar Recompensa - ${projeto.nome}`,
        content: dialogContent,
        buttons: {
            receber: {
                icon: "<i class='fas fa-box-open'></i>",
                label: "Receber",
                callback: async (htmlContent) => {
                    if (!selectedItemId) {
                        ui.notifications.warn("Selecione um item antes de receber!");
                        return;
                    }
                    const selectedOpt = resolvedOptions.find(o => o.id === selectedItemId);
                    if (!selectedOpt) return;

                    if (selectedOpt.source === "compendium") {
                        await processarEntrega(selectedOpt.name, selectedOpt.pack, selectedOpt.quantity);
                    } else if (selectedOpt.source === "manual") {
                        try {
                            let itemData = {
                                name: selectedOpt.name.includes("{projeto}")
                                    ? selectedOpt.name
                                        .replace("{projeto}", projeto.nome)
                                        .replace("{complexidade}", projeto.complexidade)
                                        .replace("{raridade}", projeto.raridade || "")
                                    : selectedOpt.name,
                                type: selectedOpt.type,
                                img: selectedOpt.img,
                                system: JSON.parse(JSON.stringify(selectedOpt.system))
                            };

                            if (selectedOpt.quantity) {
                                    if (!itemData.system) itemData.system = {};
                                    itemData.system.quantity = selectedOpt.quantity;
                            }

                            if (app) {
                                tabParaManter = "professions";
                                app._scrollInfo = scrollSalvo;
                            }
                            await actor.createEmbeddedDocuments("Item", [itemData]);

                            if (onConcluidoCallback) await onConcluidoCallback(selectedOpt);

                            const contentHTML = `
                                <div style="border: 2px solid #2e8b57; background-color: #e8f5e9; padding: 8px; border-radius: 5px; font-family: 'Signika', sans-serif; color: black;">
                                    <h3 style="color: #2e8b57; border-bottom: 1px solid #2e8b57; margin: 0 0 5px 0; text-align: center; font-weight: bold;">
                                        Projeto Finalizado
                                    </h3>
                                    <div style="font-size: 13px; line-height: 1.4; margin-bottom: 5px;">
                                        <strong>Artesão:</strong> ${actor.name}<br>
                                        <strong>Projeto:</strong> ${projeto.nome}<br>
                                        <strong>Item Obtido:</strong> ${selectedOpt.name.includes("{projeto}") ? itemData.name : selectedOpt.name}
                                    </div>
                                    <div style="font-size: 14px; font-weight: bold; color: #2e8b57; text-align: center; margin-top: 5px;">
                                        <i class="fas fa-box-open"></i> Recompensa resgatada!
                                    </div>
                                </div>
                            `;

                            ChatMessage.create({
                                speaker: ChatMessage.getSpeaker({ actor }),
                                content: contentHTML
                            });

                        } catch (err) {
                            ui.notifications.error("Erro ao gerar recompensa manual.");
                        }
                    }
                }
            },
            cancelar: {
                icon: "<i class='fas fa-times'></i>",
                label: "Cancelar"
            }
        },
        default: "receber",
        render: (htmlContent) => {
            const renderList = (searchTerm = "") => {
                const listContainer = htmlContent.find('#reward-items-list');
                listContainer.empty();

                const filtered = resolvedOptions.filter(opt => 
                    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

                if (filtered.length === 0) {
                    listContainer.html('<div style="text-align: center; color: #666; padding: 20px;">Nenhum item encontrado.</div>');
                    return;
                }

                filtered.forEach(opt => {
                    const isSelected = opt.id === selectedItemId;
                    const itemHtml = $(`
                        <div class="reward-item-row" data-id="${opt.id}" style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer; transition: all 0.15s ease-in-out; border-left: 3px solid transparent; background: ${isSelected ? '#e2f0fe' : 'transparent'}; border-left-color: ${isSelected ? '#004085' : 'transparent'};">
                            <img src="${opt.img}" style="width: 28px; height: 28px; border: 1px solid #bbb; border-radius: 4px; object-fit: cover;">
                            <div style="flex: 1; font-weight: bold; font-size: 13px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${opt.name}
                            </div>
                            <span style="font-size: 9px; padding: 2px 4px; border-radius: 3px; font-weight: bold; background: ${opt.source === 'manual' ? '#fff3cd' : '#d1ecf1'}; color: ${opt.source === 'manual' ? '#856404' : '#0c5460'}; border: 1px solid ${opt.source === 'manual' ? '#ffeeba' : '#bee5eb'};">
                                ${opt.source === 'manual' ? 'Manual' : 'SRD'}
                            </span>
                        </div>
                    `);

                    itemHtml.click(() => {
                        selectedItemId = opt.id;
                        renderList(searchTerm);
                        showDetails(opt);
                    });

                    listContainer.append(itemHtml);
                });
            };

            const showDetails = (opt) => {
                const detailsContainer = htmlContent.find('#reward-details-container');
                detailsContainer.empty();

                const detailsHtml = $(`
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                            <img src="${opt.img}" style="width: 44px; height: 44px; border: 1px solid #666; border-radius: 4px; object-fit: cover;">
                            <div style="display: flex; flex-direction: column;">
                                <h4 style="margin: 0; font-weight: bold; font-size: 15px; color: #111; line-height: 1.2;">${opt.name}</h4>
                                <span style="font-size: 10px; color: #666; margin-top: 2px;">Origem: ${opt.source === 'manual' ? 'Criação Manual (Homebrew)' : 'Compêndio'}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 15px; font-size: 11px; color: #555; background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">
                            <div><i class="fas fa-weight-hanging" style="margin-right: 4px;"></i> Peso: <strong>${opt.weight} lb</strong></div>
                            <div><i class="fas fa-coins" style="margin-right: 4px;"></i> Preço: <strong>${opt.price}</strong></div>
                        </div>
                        <div class="reward-item-desc" style="font-size: 12px; line-height: 1.4; max-height: 230px; overflow-y: auto; padding-right: 4px; color: #333; font-family: 'Signika', sans-serif;">
                            ${opt.description}
                        </div>
                    </div>
                `);

                detailsContainer.append(detailsHtml);
            };

            renderList();
            if (selectedItemId) {
                const preSelectedOpt = resolvedOptions.find(o => o.id === selectedItemId);
                if (preSelectedOpt) showDetails(preSelectedOpt);
            }

            htmlContent.find('#reward-search-input').on('input', (ev) => {
                renderList(ev.currentTarget.value);
            });
        }
    }, {
        width: 620,
        classes: ["professions-reward-dialog"]
    }).render(true);
}

export async function abrirSeletorPergaminhoMagia(actor, projeto, onConcluidoCallback, app = null, scrollSalvo = null) {
    const RARIDADE_NIVEIS = {
        "Comum": [
            { level: 0, label: "Truque (Cantrip)" },
            { level: 1, label: "1º Nível" }
        ],
        "Incomum": [
            { level: 2, label: "2º Nível" },
            { level: 3, label: "3º Nível" }
        ],
        "Raro": [
            { level: 4, label: "4º Nível" },
            { level: 5, label: "5º Nível" }
        ],
        "Muito Raro": [
            { level: 6, label: "6º Nível" },
            { level: 7, label: "7º Nível" },
            { level: 8, label: "8º Nível" }
        ],
        "Lendário": [
            { level: 9, label: "9º Nível" }
        ]
    };

    const ESCOLAS_MAGIA = {
        abj: "Abjuração",
        con: "Conjuração",
        div: "Adivinhação",
        enc: "Encantamento",
        evo: "Evocação",
        ill: "Ilusão",
        nec: "Necromancia",
        trs: "Transmutação"
    };

    const precosRaridade = {
        "Comum": 50,
        "Incomum": 200,
        "Raro": 2000,
        "Muito Raro": 20000,
        "Lendário": 100000
    };

    const raridade = projeto.raridade || "Comum";
    const niveisPermitidos = RARIDADE_NIVEIS[raridade] || RARIDADE_NIVEIS["Comum"];

    const abrirBrowserParaNivel = async (targetLevel, levelLabel) => {
        ui.notifications.info(`Carregando magias de ${levelLabel}...`);

        const allSpells = [];
        for (const pack of game.packs) {
            if (pack.metadata.type !== "Item") continue;
            try {
                const index = await pack.getIndex({
                    fields: [
                        "img", "type", "system.level", "system.school", 
                        "system.description.value", "system.activation", 
                        "system.range", "system.duration", "system.components"
                    ]
                });
                for (const entry of index) {
                    if (entry.type === "spell" && Number(entry.system?.level) === Number(targetLevel)) {
                        allSpells.push({
                            id: entry._id,
                            name: entry.name,
                            img: entry.img || "icons/svg/spell-magic.svg",
                            level: targetLevel,
                            schoolKey: entry.system?.school || "",
                            school: ESCOLAS_MAGIA[entry.system?.school] || entry.system?.school || "Magia",
                            description: entry.system?.description?.value || "<p>Sem descrição disponível.</p>",
                            activation: entry.system?.activation?.type ? `${entry.system.activation.cost || 1} ${entry.system.activation.type}` : "Ação",
                            range: entry.system?.range?.value ? `${entry.system.range.value} ${entry.system.range.units || "pés"}` : (entry.system?.range?.units || "Pessoal"),
                            duration: entry.system?.duration?.value ? `${entry.system.duration.value} ${entry.system.duration.units || ""}` : (entry.system?.duration?.units || "Instantâneo"),
                            packName: pack.collection
                        });
                    }
                }
            } catch (e) {
                console.warn(`Profissões Dinâmicas | Erro ao ler compêndio ${pack.collection}:`, e);
            }
        }

        allSpells.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

        if (allSpells.length === 0) {
            ui.notifications.warn(`Nenhuma magia de ${levelLabel} foi encontrada nos compêndios ativados.`);
            return;
        }

        let selectedSpellId = null;

        const dialogContent = `
            <div class="spell-browser-container" style="display: flex; flex-direction: column; gap: 10px; font-family: 'Signika', sans-serif; height: 440px; overflow: hidden; margin-top: 5px;">
                <div class="spell-search-wrapper" style="display: flex; gap: 10px; align-items: center;">
                    <div style="flex: 2; display: flex; align-items: center; background: #fff; border: 1px solid #ccc; border-radius: 4px; padding: 4px 8px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                        <i class="fas fa-search" style="color: #666; margin-right: 8px;"></i>
                        <input type="text" id="spell-search-input" placeholder="Pesquisar magia por nome..." style="border: none; background: transparent; width: 100%; outline: none; box-shadow: none; height: 26px; font-size: 14px; color: #333;">
                    </div>
                    <select id="spell-school-filter" style="flex: 1; height: 34px; font-size: 12px; border-radius: 4px; border: 1px solid #ccc; background: #fff; padding: 0 4px;">
                        <option value="">Todas as Escolas</option>
                        <option value="abj">Abjuração</option>
                        <option value="con">Conjuração</option>
                        <option value="div">Adivinhação</option>
                        <option value="enc">Encantamento</option>
                        <option value="evo">Evocação</option>
                        <option value="ill">Ilusão</option>
                        <option value="nec">Necromancia</option>
                        <option value="trs">Transmutação</option>
                    </select>
                </div>
                <div class="spell-split-body" style="display: flex; gap: 12px; height: calc(100% - 46px); min-height: 0;">
                    <!-- Lista de Magias (Esquerda) -->
                    <div class="spell-list-pane" style="flex: 1.1; border: 1px solid #ccc; border-radius: 4px; background: rgba(0,0,0,0.02); overflow-y: auto; display: flex; flex-direction: column; height: 370px;">
                        <div id="spells-items-list" style="display: flex; flex-direction: column;"></div>
                    </div>
                    <!-- Detalhes da Magia (Direita) -->
                    <div class="spell-details-pane" id="spell-details-container" style="flex: 1.5; border: 1px solid #ccc; border-radius: 4px; background: #fff; padding: 12px; overflow-y: auto; color: #222; display: flex; flex-direction: column; gap: 10px; height: 370px; box-shadow: inset 0 0 5px rgba(0,0,0,0.05);">
                        <div style="text-align: center; color: #777; margin-top: 110px;">
                            <i class="fas fa-magic" style="font-size: 28px; margin-bottom: 10px; display: block; color: #4b0082;"></i>
                            Selecione uma magia da lista para visualizar a descrição e detalhes.
                        </div>
                    </div>
                </div>
            </div>
        `;

        new Dialog({
            title: `Pergaminho de Magia (${raridade}) - Selecionar Magia (${levelLabel})`,
            content: dialogContent,
            buttons: {
                receber: {
                    icon: "<i class='fas fa-scroll'></i>",
                    label: "Criar Pergaminho",
                    callback: async (htmlContent) => {
                        if (!selectedSpellId) {
                            ui.notifications.warn("Selecione uma magia antes de criar o pergaminho!");
                            return;
                        }
                        const selectedSpell = allSpells.find(s => s.id === selectedSpellId);
                        if (!selectedSpell) return;

                        try {
                            const pack = game.packs.get(selectedSpell.packName);
                            const spellDoc = await pack.getDocument(selectedSpell.id);
                            
                            let scrollData = null;
                            if (typeof dnd5e?.documents?.Item5e?.createScrollFromSpell === "function") {
                                const scrollDoc = await dnd5e.documents.Item5e.createScrollFromSpell(spellDoc);
                                scrollData = scrollDoc.toObject();
                                scrollData.name = `Pergaminho de Magia: ${spellDoc.name}`;
                            } else {
                                const spellObj = spellDoc.toObject();
                                scrollData = {
                                    name: `Pergaminho de Magia: ${spellDoc.name}`,
                                    type: "consumable",
                                    img: spellDoc.img || "icons/sundries/scrolls/scroll-bound-glowing.webp",
                                    system: {
                                        description: {
                                            value: `<p><strong>Pergaminho de Magia (${raridade}) contendo a magia <em>${spellDoc.name}</em>.</strong></p><hr>${spellObj.system?.description?.value || ""}`
                                        },
                                        type: { value: "scroll" },
                                        consumableType: "scroll",
                                        weight: 0.5,
                                        price: { value: precosRaridade[raridade] || 50, denomination: "gp" },
                                        quantity: 1,
                                        activities: spellObj.system?.activities || {}
                                    }
                                };
                            }

                            if (app) {
                                tabParaManter = "professions";
                                app._scrollInfo = scrollSalvo;
                            }
                            await actor.createEmbeddedDocuments("Item", [scrollData]);

                            if (onConcluidoCallback) await onConcluidoCallback(selectedSpell);

                            const contentHTML = `
                                <div style="border: 2px solid #4b0082; background-color: #f3e5f5; padding: 8px; border-radius: 5px; font-family: 'Signika', sans-serif; color: black;">
                                    <h3 style="color: #4b0082; border-bottom: 1px solid #4b0082; margin: 0 0 5px 0; text-align: center; font-weight: bold;">
                                        Pergaminho Confeccionado
                                    </h3>
                                    <div style="font-size: 13px; line-height: 1.4; margin-bottom: 5px;">
                                        <strong>Escriba:</strong> ${actor.name}<br>
                                        <strong>Projeto:</strong> ${projeto.nome}<br>
                                        <strong>Magia Escolhida:</strong> ${spellDoc.name} (${levelLabel})
                                    </div>
                                    <div style="font-size: 14px; font-weight: bold; color: #4b0082; text-align: center; margin-top: 5px;">
                                        <i class="fas fa-scroll"></i> Pergaminho adicionado ao inventário!
                                    </div>
                                </div>
                            `;

                            ChatMessage.create({
                                speaker: ChatMessage.getSpeaker({ actor }),
                                content: contentHTML
                            });

                        } catch (err) {
                            ui.notifications.error("Erro ao gerar pergaminho: " + err.message);
                        }
                    }
                },
                voltar: {
                    icon: "<i class='fas fa-arrow-left'></i>",
                    label: "Voltar",
                    callback: () => {
                        if (niveisPermitidos.length > 1) {
                            abrirDialogoEtapa1();
                        }
                    }
                },
                cancelar: {
                    icon: "<i class='fas fa-times'></i>",
                    label: "Cancelar"
                }
            },
            default: "receber",
            render: (htmlContent) => {
                const renderList = () => {
                    const listContainer = htmlContent.find('#spells-items-list');
                    listContainer.empty();

                    const searchTerm = htmlContent.find('#spell-search-input').val()?.toLowerCase() || "";
                    const selectedSchool = htmlContent.find('#spell-school-filter').val() || "";

                    const filtered = allSpells.filter(spell => {
                        const matchName = spell.name.toLowerCase().includes(searchTerm);
                        const matchSchool = !selectedSchool || spell.schoolKey === selectedSchool;
                        return matchName && matchSchool;
                    });

                    if (filtered.length === 0) {
                        listContainer.html('<div style="text-align: center; color: #666; padding: 20px;">Nenhuma magia encontrada.</div>');
                        return;
                    }

                    filtered.forEach(spell => {
                        const isSelected = spell.id === selectedSpellId;
                        const spellHtml = $(`
                            <div class="spell-item-row" data-id="${spell.id}" style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer; transition: all 0.15s ease-in-out; border-left: 3px solid transparent; background: ${isSelected ? '#f3e5f5' : 'transparent'}; border-left-color: ${isSelected ? '#4b0082' : 'transparent'};">
                                <img src="${spell.img}" style="width: 28px; height: 28px; border: 1px solid #bbb; border-radius: 4px; object-fit: cover;">
                                <div style="flex: 1; font-weight: bold; font-size: 13px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    ${spell.name}
                                </div>
                                <span style="font-size: 9px; padding: 2px 4px; border-radius: 3px; font-weight: bold; background: #e1bee7; color: #4b0082; border: 1px solid #ce93d8;">
                                    ${spell.school}
                                </span>
                            </div>
                        `);

                        spellHtml.click(() => {
                            selectedSpellId = spell.id;
                            renderList();
                            showDetails(spell);
                        });

                        listContainer.append(spellHtml);
                    });
                };

                const showDetails = (spell) => {
                    const detailsContainer = htmlContent.find('#spell-details-container');
                    detailsContainer.empty();

                    const detailsHtml = $(`
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                                <img src="${spell.img}" style="width: 44px; height: 44px; border: 1px solid #4b0082; border-radius: 4px; object-fit: cover;">
                                <div style="display: flex; flex-direction: column;">
                                    <h4 style="margin: 0; font-weight: bold; font-size: 15px; color: #111; line-height: 1.2;">${spell.name}</h4>
                                    <span style="font-size: 11px; color: #4b0082; margin-top: 2px; font-weight: bold;">${levelLabel} - ${spell.school}</span>
                                </div>
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px; color: #444; background: #f9f9f9; padding: 6px 8px; border-radius: 4px; border: 1px solid #eee;">
                                <div><i class="fas fa-clock" style="color: #4b0082; margin-right: 3px;"></i> <strong>Conjuração:</strong> ${spell.activation}</div>
                                <div><i class="fas fa-ruler-combined" style="color: #4b0082; margin-right: 3px;"></i> <strong>Alcance:</strong> ${spell.range}</div>
                                <div><i class="fas fa-hourglass-half" style="color: #4b0082; margin-right: 3px;"></i> <strong>Duração:</strong> ${spell.duration}</div>
                            </div>
                            <div class="spell-item-desc" style="font-size: 12px; line-height: 1.4; max-height: 240px; overflow-y: auto; padding-right: 4px; color: #333; font-family: 'Signika', sans-serif;">
                                ${spell.description}
                            </div>
                        </div>
                    `);

                    detailsContainer.append(detailsHtml);
                };

                renderList();

                htmlContent.find('#spell-search-input').on('input', renderList);
                htmlContent.find('#spell-school-filter').on('change', renderList);
            }
        }, {
            width: 640,
            classes: ["professions-spell-dialog"]
        }).render(true);
    };

    const abrirDialogoEtapa1 = () => {
        if (niveisPermitidos.length === 1) {
            abrirBrowserParaNivel(niveisPermitidos[0].level, niveisPermitidos[0].label);
            return;
        }

        const buttons = {};
        niveisPermitidos.forEach(n => {
            buttons[`level_${n.level}`] = {
                icon: "<i class='fas fa-magic'></i>",
                label: n.label,
                callback: () => abrirBrowserParaNivel(n.level, n.label)
            };
        });
        buttons["cancelar"] = {
            icon: "<i class='fas fa-times'></i>",
            label: "Cancelar"
        };

        new Dialog({
            title: `Pergaminho de Magia (${raridade}) - Selecionar Nível`,
            content: `
                <div style="font-family: 'Signika', sans-serif; text-align: center; padding: 10px 0;">
                    <p style="font-size: 14px; color: #333; margin-bottom: 15px;">
                        Escolha o nível da magia que você deseja escrever no pergaminho de raridade <strong>${raridade}</strong>:
                    </p>
                </div>
            `,
            buttons: buttons,
            default: `level_${niveisPermitidos[0].level}`
        }).render(true);
    };

    abrirDialogoEtapa1();
}
