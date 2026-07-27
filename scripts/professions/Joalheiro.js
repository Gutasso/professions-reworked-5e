import { JOALHEIRO_GEMA, JOALHEIRO_ENCRUSTAR, COMPLEXIDADE_PROJETO } from '../constants.js';

export const Joalheiro = {
    nome: "Joalheiro",

    atualizarDropdown(container) {
        const s = container.find('.new-project-subtype');
        const x = container.find('.new-project-complexity');
        const gr = container.find('.new-project-gem-rarity');
        const vi = container.find('.new-project-value');
        const ger = container.find('.new-project-rarity');
        if (!s.length) return;

        const v = s.val();
        gr.hide();
        vi.hide();
        ger.hide();
        x.prop('disabled', false);
        x.show();

        if (v === "Gema Lapidada") {
            gr.show();
            vi.show();
            x.hide();
        } else if (v === "Encrustar Gemas para Encantamento") {
            ger.show();
            x.html('<option value="Complexo">Complexo</option>');
            x.prop('disabled', true);
        } else {
            x.html(`
                <option value="Simples">Simples</option>
                <option value="Moderadamente Complexo">Moderado</option>
                <option value="Complexo">Complexo</option>
                <option value="Muito Complexo">Muito Complexo</option>
            `);
        }
    },

    onCreateProject(projectData, container, { actor }) {
        const subTipo = projectData.subTipo;
        let valorComplexidade = container.find('.new-project-complexity').val();
        const valorRaridadePreparo = container.find('.new-project-rarity').val();
        const valorGemaRaridade = container.find('.new-project-gem-rarity').val();
        const valorGemaPC = parseInt(container.find('.new-project-value').val()) || 0;

        if (subTipo === "Gema Lapidada") {
            if (!valorGemaRaridade) {
                ui.notifications.warn("Selecione a Raridade da Gema!");
                return false;
            }
            if (valorGemaPC <= 0) {
                ui.notifications.warn("Insira um Valor inicial válido!");
                return false;
            }
            projectData.raridade = valorGemaRaridade;
            projectData.valorAtual = valorGemaPC;
            const configGema = JOALHEIRO_GEMA[valorGemaRaridade];
            if (configGema) {
                projectData.complexidade = configGema.complexidade;
            }
        } else if (subTipo === "Encrustar Gemas para Encantamento") {
            if (!valorRaridadePreparo) {
                ui.notifications.warn("Selecione a Raridade do Item!");
                return false;
            }
            projectData.raridade = valorRaridadePreparo;
            const configEncrustar = JOALHEIRO_ENCRUSTAR[valorRaridadePreparo];
            if (configEncrustar) {
                projectData.dificuldadeEspecifica = configEncrustar.dificuldade;
                projectData.complexidade = "Complexo";
            }
        }
        return true;
    },

    onPreRoll(projeto, actor) {
        if (projeto.subTipo === "Gema Lapidada" && projeto.valorAtual <= 0) {
            ui.notifications.warn("Esta gema está quebrada e não pode mais ser trabalhada.");
            return false;
        }
        return true;
    },

    async handleRoll(projeto, actor, roll, res, cfg, isExpertise) {
        let msgDano = "";

        if (projeto.subTipo === "Gema Lapidada") {
            if (res.resultado === "ALTA_FALHA" || res.resultado === "GRANDE_FALHA") {
                const danoRoll = new Roll("1d4");
                await danoRoll.evaluate();
                const dano = danoRoll.total;
                projeto.valorAtual -= dano;
                if (projeto.valorAtual <= 0) projeto.valorAtual = 0;
                msgDano = `<div style="color:red; font-weight:bold; margin-top:5px;">Dano na Gema: -${dano} PC! (Valor: ${projeto.valorAtual})</div>`;
                if (projeto.valorAtual === 0) msgDano += `<div style="color:red; font-weight:bold;">A GEMA QUEBROU!</div>`;
            }
        }

        const compConfig = COMPLEXIDADE_PROJETO[projeto.complexidade];
        const metaAcertos = compConfig ? compConfig.acertosNecessarios : 100;
        projeto.acertosAtuais = Math.min(projeto.acertosAtuais + res.acertos, metaAcertos);

        if (projeto.acertosAtuais >= metaAcertos && !projeto.dataConclusao) {
            projeto.dataConclusao = Date.now();
        }

        const xpText = `(+${res.acertos} Acertos)`;

        const detalhesResultado = `
            <div style="font-size: 14px; font-weight: bold; color: ${cfg.color}; margin-top: 5px;">
                ${cfg.label} <span style="font-size: 12px; color: #555;">${xpText}</span>
            </div>
            ${msgDano}
        `;
        return detalhesResultado;
    },

    prepareProject(projeto, comp, { actor }) {
        if (projeto.subTipo === "Gema Lapidada") {
            const diffDisplay = projeto.dificuldadeEspecifica || comp.dificuldade;
            const isQuebrada = projeto.valorAtual !== undefined && projeto.valorAtual <= 0;
            return {
                infoExtra: ` (${projeto.raridade} - ${diffDisplay} - ${projeto.complexidade})`,
                exibirValor: true,
                isQuebrada: isQuebrada
            };
        }
        if (projeto.subTipo === "Encrustar Gemas para Encantamento" && projeto.raridade) {
            const diffDisplay = projeto.dificuldadeEspecifica || comp.dificuldade;
            return {
                infoExtra: ` (${projeto.raridade} - ${diffDisplay} - ${projeto.complexidade})`
            };
        }
        return null;
    }
};
