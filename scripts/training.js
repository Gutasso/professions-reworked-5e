import { calcularResultado } from './logic.js';
import { 
    TREINAMENTO_CONFIG, 
    TREINO_ATRIBUTO_RANGES, 
    LANGUAGES_DATA, 
    PROFISSOES_CONFIG, 
    RESULTADO_FORMAT, 
    ATRIBUTOS 
} from './constants.js';

export function prepareTrainingData(actor) {
    let treinosAtivos = actor.getFlag("professions-reworked-5e", "treinosAtivos") || [];
    let treinosColapsos = actor.getFlag("professions-reworked-5e", "treinosColapsos") || {};
    let listaTreinamentos = actor.getFlag("professions-reworked-5e", "listaTreinamentos") || [];

    const listaAtributos = Object.entries(ATRIBUTOS).map(([k, v]) => ({ value: k, label: v }));

    // 1. PREPARAÇÃO DE DADOS DE PERÍCIA
    const skillsDisponiveis = Object.entries(actor.system.skills)
        .filter(([key, skill]) => skill.value < 2)
        .map(([key, skill]) => ({
            key: key,
            label: CONFIG.DND5E.skills[key]?.label || key
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    // 2. PREPARAÇÃO DE DADOS DE RESISTÊNCIA
    const savesDisponiveis = Object.entries(actor.system.abilities)
        .filter(([key, ability]) => ability.proficient === 0)
        .map(([key, ability]) => ({
            key: key,
            label: ATRIBUTOS[key]
        }));

    // 3. PREPARAÇÃO DE DADOS DE PROFISSÃO PARA TREINO
    const profissoesDisponiveisTreino = [];
    actor.items.forEach(item => {
        if (item.type === "tool") {
            const baseItem = item.system.type?.baseItem;
            const multiplier = item.system.prof?.multiplier || 0;
            
            if (multiplier < 2) {
                for (const [nomeProf, config] of Object.entries(PROFISSOES_CONFIG)) {
                    if (config.ferramenta === baseItem) {
                        if (!profissoesDisponiveisTreino.find(p => p.nome === nomeProf)) {
                            profissoesDisponiveisTreino.push({ nome: nomeProf });
                        }
                    }
                }
            }
        }
    });
    profissoesDisponiveisTreino.sort((a, b) => a.nome.localeCompare(b.nome));

    // 4. IDIOMAS
    const linguasConhecidasDoAtor = new Set(actor.system.traits.languages.value.map(l => l.toLowerCase()));
    const mapaSistema = {"thieve's cant": "cant", "deep speech": "deep"};
    const idiomasDisponiveis = Object.keys(LANGUAGES_DATA).filter(langName => {
        const langKey = langName.toLowerCase();
        const systemKey = mapaSistema[langKey] || langKey;
        return !linguasConhecidasDoAtor.has(systemKey);
    }).sort();

    // 5. MAPEAR TREINAMENTOS ATIVOS PARA RENDER
    const treinosRender = treinosAtivos.map(tKey => {
        const config = TREINAMENTO_CONFIG[tKey] || { label: tKey, icon: "fa-question" };
        
        const listaDaCategoria = listaTreinamentos
            .map((treino, index) => ({ ...treino, _index: index }))
            .filter(treino => treino.categoria === tKey)
            .map(treino => {
                const totalNecessario = treino.totalNecessario || 50;
                const isConcluido = treino.acertosAtuais >= totalNecessario;
                if (!treino.atributoPadrao) treino.atributoPadrao = "str";
                
                return {
                    ...treino,
                    totalNecessario: totalNecessario,
                    porcentagem: (totalNecessario > 0 ? Math.min((treino.acertosAtuais / totalNecessario) * 100, 100) : 0),
                    isConcluido: isConcluido,
                    atributosLocais: listaAtributos
                };
            });

        return {
            nome: tKey,
            label: config.label,
            icon: config.icon,
            isCollapsed: treinosColapsos[tKey] || false,
            treinos: listaDaCategoria
        };
    });

    return {
        treinamentosAtivos: treinosRender,
        skillsDisponiveis,
        atributosDisponiveis: listaAtributos,
        savesDisponiveis,
        idiomasDisponiveis,
        profissoesDisponiveisTreino
    };
}

export function registerTrainingListeners(html, actor, { salvarScroll, tabParaManter }) {
    const $html = $(html);
    const getTreinosAtivos = () => actor.getFlag("professions-reworked-5e", "treinosAtivos") || [];
    const getTreinosColapsos = () => actor.getFlag("professions-reworked-5e", "treinosColapsos") || {};
    const getListaTreinamentos = () => actor.getFlag("professions-reworked-5e", "listaTreinamentos") || [];

    $html.find('.add-training-btn').off('click.professions').on('click.professions', async (ev) => {
        salvarScroll();
        const treinosAtivos = getTreinosAtivos();
        const listaTreinamentos = getListaTreinamentos();
        const novoTreino = $html.find('.select-new-training').val();
        if (!treinosAtivos.includes(novoTreino)) {
            treinosAtivos.push(novoTreino);
            await actor.setFlag("professions-reworked-5e", "treinosAtivos", treinosAtivos);
        }
    });

    $html.find('.remove-training').off('click.professions').on('click.professions', async (ev) => {
        ev.stopPropagation();
        salvarScroll();
        const type = ev.currentTarget.closest('.training-section').dataset.type;
        const confirm = await Dialog.confirm({ title: "Remover", content: `<p>Parar o <strong>${type}</strong>?</p>` });
        if (confirm) {
            const treinosAtivos = getTreinosAtivos();
            const novosTreinos = treinosAtivos.filter(t => t !== type);
            await actor.setFlag("professions-reworked-5e", "treinosAtivos", novosTreinos);
        }
    });

    $html.find('.training-header').off('click.professions').on('click.professions', async (ev) => {
        if ($(ev.target).closest('.remove-training').length) return;
        salvarScroll();
        const type = ev.currentTarget.closest('.training-section').dataset.type;
        const treinosColapsos = getTreinosColapsos();
        treinosColapsos[type] = !treinosColapsos[type];
        await actor.setFlag("professions-reworked-5e", "treinosColapsos", treinosColapsos);
    });

    $html.find('.start-skill-training-btn').off('click.professions').on('click.professions', async (ev) => {
        salvarScroll();
        const container = $(ev.currentTarget).closest('.project-creation-form');
        const skillKey = container.find('.new-training-skill').val();
        const listaTreinamentos = getListaTreinamentos();

        if (!skillKey) {
            ui.notifications.warn("Selecione uma perícia para treinar!");
            return;
        }

        const skillData = actor.system.skills[skillKey];
        const skillLabel = CONFIG.DND5E.skills[skillKey]?.label || skillKey;
        
        const isProficient = (skillData.value === 1);
        const meta = isProficient ? 50 : 20;
        const diff = isProficient ? "Difícil" : "Fácil";
        const infoExtra = isProficient ? "(Proficiente - Difícil)" : "(Sem Proficiência - Fácil)";

        listaTreinamentos.push({
            categoria: "Perícia",
            nome: `Treinamento de ${skillLabel}`,
            skillKey: skillKey,
            acertosAtuais: 0,
            totalNecessario: meta,
            dificuldadeEspecifica: diff,
            infoExtra: infoExtra,
            usoVantagem: false,
            usoDesvantagem: false,
            bonusSituacional: ""
        });

        await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
    });

    $html.find('.start-attribute-training-btn').off('click.professions').on('click.professions', async (ev) => {
        salvarScroll();
        const container = $(ev.currentTarget).closest('.project-creation-form');
        const attrKey = container.find('.new-training-attribute').val();
        const listaTreinamentos = getListaTreinamentos();

        if (!attrKey) {
            ui.notifications.warn("Selecione um atributo para treinar!");
            return;
        }

        const attrLabel = ATRIBUTOS[attrKey];
        const valorAtual = actor.system.abilities[attrKey].value;

        const config = TREINO_ATRIBUTO_RANGES.find(r => valorAtual <= r.max) || TREINO_ATRIBUTO_RANGES[TREINO_ATRIBUTO_RANGES.length - 1];
        const infoExtra = `(Valor atual: ${valorAtual} - ${config.diff})`;

        listaTreinamentos.push({
            categoria: "Atributo",
            nome: `Treinamento de ${attrLabel}`,
            attrKey: attrKey,
            acertosAtuais: 0,
            totalNecessario: config.meta,
            dificuldadeEspecifica: config.diff,
            infoExtra: infoExtra,
            usoVantagem: false,
            usoDesvantagem: false,
            bonusSituacional: ""
        });

        await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
    });

    $html.find('.start-save-training-btn').off('click.professions').on('click.professions', async (ev) => {
        salvarScroll();
        const container = $(ev.currentTarget).closest('.project-creation-form');
        const attrKey = container.find('.new-training-save').val();
        const listaTreinamentos = getListaTreinamentos();

        if (!attrKey) {
            ui.notifications.warn("Selecione uma resistência para treinar!");
            return;
        }

        const attrLabel = ATRIBUTOS[attrKey];
        const hasSaveProf = actor.system.abilities[attrKey].proficient === 1;

        if (hasSaveProf) {
            ui.notifications.warn(`Você já possui proficiência na resistência de ${attrLabel}!`);
            return;
        }

        listaTreinamentos.push({
            categoria: "Resistência",
            nome: `Treinamento de Resistência (${attrLabel})`,
            attrKey: attrKey,
            acertosAtuais: 0,
            totalNecessario: 50,
            dificuldadeEspecifica: "Difícil",
            infoExtra: "(Resistência - Difícil)",
            usoVantagem: false,
            usoDesvantagem: false,
            bonusSituacional: ""
        });

        await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
    });

    $html.find('.start-feat-training-btn').off('click.professions').on('click.professions', async (ev) => {
        salvarScroll();
        const container = $(ev.currentTarget).closest('.project-creation-form');
        const featName = container.find('.new-training-name-feat, .new-training-feat-name').val();
        const attrKey = container.find('.new-training-feat-attr').val() || "int";
        const listaTreinamentos = getListaTreinamentos();

        if (!featName || featName.trim() === "") {
            ui.notifications.warn("Digite o nome do talento para treinar!");
            return;
        }

        const attrLabel = ATRIBUTOS[attrKey] || "Inteligência";

        listaTreinamentos.push({
            categoria: "Talento",
            nome: `Treinamento de Talento: ${featName.trim()}`,
            atributoPadrao: attrKey,
            acertosAtuais: 0,
            totalNecessario: 100,
            dificuldadeEspecifica: "Difícil",
            infoExtra: `(Talento - Difícil - Atributo: ${attrLabel})`,
            usoVantagem: false,
            usoDesvantagem: false,
            bonusSituacional: ""
        });

        await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
    });

    $html.find('.start-language-training-btn').off('click.professions').on('click.professions', async (ev) => {
        salvarScroll();
        const container = $(ev.currentTarget).closest('.project-creation-form');
        const langName = container.find('.new-training-language, .new-training-language-name').val();
        const listaTreinamentos = getListaTreinamentos();

        if (!langName || langName.trim() === "") {
            ui.notifications.warn("Selecione o idioma para treinar!");
            return;
        }

        listaTreinamentos.push({
            categoria: "Idioma",
            nome: `Treinamento de Idioma: ${langName.trim()}`,
            acertosAtuais: 0,
            totalNecessario: 30,
            dificuldadeEspecifica: "Médio",
            infoExtra: "(Idioma - Médio)",
            usoVantagem: false,
            usoDesvantagem: false,
            bonusSituacional: ""
        });

        await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
    });

    $html.find('.start-profession-training-btn').off('click.professions').on('click.professions', async (ev) => {
        salvarScroll();
        const container = $(ev.currentTarget).closest('.project-creation-form');
        const profName = container.find('.new-training-profession-target').val();
        const listaTreinamentos = getListaTreinamentos();

        if (!profName) {
            ui.notifications.warn("Selecione uma profissão para treinar!");
            return;
        }

        const profissoesAtivas = actor.getFlag("professions-reworked-5e", "profissoesAtivas") || [];
        const isAprendida = profissoesAtivas.includes(profName);

        const configProf = PROFISSOES_CONFIG[profName];
        const baseTool = configProf ? configProf.ferramenta : "";
        const toolItem = actor.items.find(i => i.type === "tool" && i.system.type.baseItem === baseTool);
        const isToolProf = (toolItem && toolItem.system.prof?.multiplier >= 1);

        let meta = 10;
        let estadoTexto1 = isAprendida ? "Profissão Conhecida" : "Não Conhece Profissão";
        let estadoTexto2 = isToolProf ? "Possui Proficiência na Ferramenta" : "Sem Proficiência na Ferramenta";

        if (!isAprendida && !isToolProf) {
            meta = 40;
        } else if ((isAprendida && !isToolProf) || (!isAprendida && isToolProf)) {
            meta = 20;
        } else if (isAprendida && isToolProf) {
            meta = 10;
        }

        listaTreinamentos.push({
            categoria: "Profissão",
            profissaoAlvo: profName,
            nome: `Treinamento de ${profName}`,
            timestamp: Date.now(),
            acertosAtuais: 0,
            totalNecessario: meta,
            dificuldadeEspecifica: "Variável",
            infoExtra: `(${estadoTexto1} - ${estadoTexto2} - Ganhe XP completando projetos de ${profName})`,
            usoVantagem: false,
            usoDesvantagem: false,
            bonusSituacional: ""
        });

        await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
    });

    $html.find('.delete-training-card').off('click.professions').on('click.professions', async (ev) => {
        salvarScroll();
        const card = ev.currentTarget.closest('.project-card');
        const index = parseInt(card.dataset.index);
        const listaTreinamentos = getListaTreinamentos();
        
        if (!isNaN(index) && listaTreinamentos[index]) {
            const confirm = await Dialog.confirm({ 
                title: "Excluir Treino", 
                content: `<p>Excluir <strong>${listaTreinamentos[index].nome}</strong>?</p>` 
            });
            if (confirm) {
                listaTreinamentos.splice(index, 1);
                await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
            }
        }
    });

    $html.find('.edit-training-name').off('click.professions').on('click.professions', async (ev) => {
        ev.stopPropagation();
        salvarScroll();
        const card = ev.currentTarget.closest('.project-card');
        const index = parseInt(card.dataset.index);
        const listaTreinamentos = getListaTreinamentos();
        const treino = listaTreinamentos[index];

        if (treino) {
            new Dialog({
                title: "Renomear Treinamento",
                content: `<form><div class="form-group"><label>Novo Nome:</label><input type="text" name="novoNome" value="${treino.nome}" autofocus></div></form>`,
                buttons: {
                    salvar: {
                        label: "Salvar",
                        icon: '<i class="fas fa-check"></i>',
                        callback: async (html) => {
                            const novoNome = html.find('[name="novoNome"]').val();
                            if (novoNome && novoNome.trim() !== "") {
                                listaTreinamentos[index].nome = novoNome.trim();
                                await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
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

    $html.find('.train-attribute-select').off('change.professions').on('change.professions', async (ev) => {
        salvarScroll();
        const card = ev.currentTarget.closest('.project-card');
        const index = parseInt(card.dataset.index);
        const listaTreinamentos = getListaTreinamentos();
        if (!isNaN(index) && listaTreinamentos[index]) {
            listaTreinamentos[index].atributoPadrao = ev.currentTarget.value;
            await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
        }
    });

    $html.find('.train-adv-checkbox').off('change.professions').on('change.professions', async (ev) => {
        salvarScroll();
        const card = ev.currentTarget.closest('.project-card');
        const index = parseInt(card.dataset.index);
        const listaTreinamentos = getListaTreinamentos();
        if (!isNaN(index) && listaTreinamentos[index]) {
            listaTreinamentos[index].usoVantagem = ev.currentTarget.checked;
            await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
        }
    });

    $html.find('.train-disadv-checkbox').off('change.professions').on('change.professions', async (ev) => {
        salvarScroll();
        const card = ev.currentTarget.closest('.project-card');
        const index = parseInt(card.dataset.index);
        const listaTreinamentos = getListaTreinamentos();
        if (!isNaN(index) && listaTreinamentos[index]) {
            listaTreinamentos[index].usoDesvantagem = ev.currentTarget.checked;
            await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
        }
    });

    $html.find('.train-bonus').off('change.professions').on('change.professions', async (ev) => {
        salvarScroll();
        const card = ev.currentTarget.closest('.project-card');
        const index = parseInt(card.dataset.index);
        const listaTreinamentos = getListaTreinamentos();
        if (!isNaN(index) && listaTreinamentos[index]) {
            listaTreinamentos[index].bonusSituacional = ev.currentTarget.value;
            await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);
        }
    });

    $html.find('.roll-training-test').off('click.professions').on('click.professions', async (ev) => {
        salvarScroll();
        const card = ev.currentTarget.closest('.project-card');
        const index = parseInt(card.dataset.index);
        const listaTreinamentos = getListaTreinamentos();
        const treino = listaTreinamentos[index];

        if (!treino) return;

        const hasAdv = treino.usoVantagem || false;
        const hasDis = treino.usoDesvantagem || false;
        const bonusSit = treino.bonusSituacional || "";

        let diceFormula = "1d20";
        if (hasAdv && !hasDis) diceFormula = "2d20kh1";
        else if (!hasAdv && hasDis) diceFormula = "2d20kl1";
        
        let formula = "";
        let nomeRolagem = "";
        
        if (treino.categoria === "Perícia") {
            const skillKey = treino.skillKey;
            const skillTotal = actor.system.skills[skillKey].total;
            nomeRolagem = CONFIG.DND5E.skills[skillKey]?.label || skillKey;
            formula = `${diceFormula} + ${skillTotal}[${nomeRolagem}]`;
        } 
        else if (treino.categoria === "Atributo" || treino.categoria === "Resistência") {
            const attrKey = treino.attrKey;
            const attrMod = actor.system.abilities[attrKey].mod;
            nomeRolagem = ATRIBUTOS[attrKey];
            formula = `${diceFormula} + ${attrMod}[${nomeRolagem}]`;
        }
        else if (treino.categoria === "Talento") {
            const attrKey = treino.atributoPadrao || "str";
            const attrMod = actor.system.abilities[attrKey].mod;
            nomeRolagem = ATRIBUTOS[attrKey];
            formula = `${diceFormula} + ${attrMod}[${nomeRolagem}]`;
        }
        else if (treino.categoria === "Idioma") {
            const skillTotal = actor.system.skills.his.total;
            nomeRolagem = CONFIG.DND5E.skills.his?.label || "História";
            formula = `${diceFormula} + ${skillTotal}[${nomeRolagem}]`;
        }

        if (bonusSit) formula += ` + ${bonusSit}[Sit]`;

        try {
            const r = new Roll(formula, actor.getRollData());
            await r.evaluate();

            const diffAlvo = treino.dificuldadeEspecifica;
            const res = calcularResultado(r.total, diffAlvo);

            treino.acertosAtuais += res.acertos;
            if (treino.acertosAtuais > treino.totalNecessario) {
                treino.acertosAtuais = treino.totalNecessario;
            }

            const cfg = RESULTADO_FORMAT[res.resultado] || { label: res.resultado, color: "black", bg: "#eee", border: "#ccc" };
            const xpText = `(+${res.acertos} Pontos de Experiência)`;

            const contentHTML = `
                <div style="border: 2px solid ${cfg.border}; background-color: ${cfg.bg}; padding: 8px; text-align: center; color: black; border-radius: 5px; font-family: 'Signika', sans-serif;">
                    <h3 style="color: ${cfg.color}; border-bottom: 1px solid ${cfg.border}; margin: 0 0 5px 0; font-weight: bold;">
                        ${cfg.label}
                    </h3>
                    <div style="font-size: 12px; margin-bottom: 5px; color: #444;">
                        <strong>${treino.nome}</strong><br>
                        (Dificuldade: ${diffAlvo})
                    </div>
                    <div style="font-size: 14px; font-weight: bold; color: ${cfg.color}; margin-top: 5px;">
                        ${cfg.label} <span style="font-size: 12px; color: #555;">${xpText}</span>
                    </div>
                </div>
            `;

            await actor.setFlag("professions-reworked-5e", "listaTreinamentos", listaTreinamentos);

            r.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                flavor: contentHTML
            });

        } catch (err) {
            ui.notifications.error("Erro no treino: " + err.message);
        }
    });
}
