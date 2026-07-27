import { CARTOGRAFO_BIOMAS_LISTA, CARTOGRAFO_RASCUNHO_INC, CARTOGRAFO_BIOMA_DIFF } from '../constants.js';

export const Cartografo = {
    nome: "Cartógrafo",

    atualizarDropdown(container) {
        const subTipoSelect = container.find('.new-project-subtype');
        const complexitySelect = container.find('.new-project-complexity');
        if (!subTipoSelect.length) return;

        const valorAtual = subTipoSelect.val();
        complexitySelect.prop('disabled', false);
        complexitySelect.show();

        if (valorAtual === "Cópia de Mapa") {
            complexitySelect.html('<option value="Moderadamente Complexo">Moderado</option>');
            complexitySelect.prop('disabled', true);
        } else if (valorAtual === "Desenho de Mapa") {
            complexitySelect.hide();
        }
    },

    onCreateProject(projectData, container, { actor }) {
        const subTipo = projectData.subTipo;

        if (subTipo === "Cópia de Mapa") {
            projectData.complexidade = "Moderadamente Complexo";
        } else if (subTipo === "Desenho de Mapa") {
            projectData.fase = "rascunho";
            projectData.totalNecessario = 0;
            projectData.acertosTotaisPreparo = 0;
            projectData.complexidade = "Simples";
            projectData.dificuldadeEspecifica = "Selecione Bioma";
        }
        return true;
    },

    onBiomeChange(projeto, novoBioma, actor) {
        if (projeto.subTipo === "Desenho de Mapa") {
            const novaDiff = CARTOGRAFO_BIOMA_DIFF[novoBioma];
            if (novaDiff) {
                projeto.dificuldadeEspecifica = novaDiff;
                const compMap = {
                    "Fácil": "Simples",
                    "Médio": "Moderadamente Complexo",
                    "Difícil": "Complexo",
                    "Muito Difícil": "Muito Complexo"
                };
                projeto.complexidade = compMap[novaDiff] || "Simples";
                return true;
            }
        }
        return false;
    },

    onPreRoll(projeto, actor) {
        if (projeto.fase === "rascunho" && (!projeto.bioma || projeto.dificuldadeEspecifica === "Selecione Bioma")) {
            ui.notifications.warn("Selecione o Bioma no card do projeto!");
            return false;
        }
        return true;
    },

    async handleRoll(projeto, actor, roll, res, cfg, isExpertise) {
        let detalhesResultado = "";

        if (projeto.subTipo === "Cópia de Mapa") {
            let acertos = res.acertos;
            if (isExpertise) acertos *= 2;

            const metaAcertos = projeto.acertosTotaisPreparo || 10;
            projeto.acertosAtuais = Math.min(projeto.acertosAtuais + acertos, metaAcertos);

            if (projeto.acertosAtuais >= metaAcertos && !projeto.dataConclusao) {
                projeto.dataConclusao = Date.now();
            }

            let xpText = `(+${acertos} Acertos)`;
            if (isExpertise) xpText += " (Expertise!)";

            detalhesResultado = `
                <div style="font-size: 14px; font-weight: bold; color: ${cfg.color}; margin-top: 5px;">
                    ${cfg.label} <span style="font-size: 12px; color: #555;">${xpText}</span>
                </div>
            `;
        } else if (projeto.fase === "rascunho") {
            const incremento = CARTOGRAFO_RASCUNHO_INC[res.resultado] || 0;
            if (!projeto.totalNecessario) projeto.totalNecessario = 0;
            projeto.totalNecessario += incremento;
            detalhesResultado = `<div style="font-size: 13px; color: #333;">Meta aumentada em: <strong>+${incremento}</strong><br>Nova Meta: <strong>${projeto.totalNecessario}</strong></div>`;
        } else if (projeto.fase === "definitivo") {
            let acertos = res.acertos;
            if (isExpertise) acertos *= 2;

            const metaAcertos = projeto.totalNecessario || 0;
            projeto.acertosAtuais = Math.min(projeto.acertosAtuais + acertos, metaAcertos);

            let xpText = `(+${acertos} Acertos)`;
            if (isExpertise) xpText += " (Expertise!)";

            detalhesResultado = `
                <div style="font-size: 14px; font-weight: bold; color: ${cfg.color}; margin-top: 5px;">
                    ${cfg.label} <span style="font-size: 12px; color: #555;">${xpText}</span>
                </div>
            `;
        }
        return detalhesResultado;
    },

    prepareProject(projeto, comp, { actor }) {
        const isRascunho = (projeto.fase === "rascunho");
        const isDesenhoDefinitivo = (projeto.fase === "definitivo");

        if (projeto.subTipo === "Desenho de Mapa") {
            let details = {
                isRascunho: isRascunho,
                isDesenhoDefinitivo: isDesenhoDefinitivo,
                totalNecessario: projeto.totalNecessario || 0,
                podeConcluir: isDesenhoDefinitivo && (projeto.totalNecessario > 0) && (projeto.acertosAtuais >= projeto.totalNecessario)
            };

            const diffDisplay = projeto.dificuldadeEspecifica || "Selecione Bioma";
            const labels = {
                "Simples": "Simples",
                "Moderadamente Complexo": "Moderado",
                "Complexo": "Complexo",
                "Muito Complexo": "Muito Complexo"
            };
            const compLabel = labels[projeto.complexidade] || "Simples";

            if (isRascunho) {
                details.infoExtra = ` (Rascunho - ${projeto.bioma || "?"} - ${diffDisplay})`;
                details.listaBiomas = CARTOGRAFO_BIOMAS_LISTA;
            } else if (isDesenhoDefinitivo) {
                details.infoExtra = ` (Desenho Definitivo - ${projeto.bioma || "?"} - ${diffDisplay})`;
            }
            return details;
        }

        if (projeto.subTipo === "Cópia de Mapa") {
            const diff = projeto.dificuldadeEspecifica || comp.dificuldade;
            return {
                infoExtra: ` (${projeto.complexidade} - ${diff})`
            };
        }
        return null;
    },

    registerListeners(html, actor, { salvarScroll }) {
        html.find('.finish-draft-btn').click(async (ev) => {
            ev.stopPropagation();
            salvarScroll();
            const card = ev.currentTarget.closest('.project-card');
            const index = card.dataset.index;
            const confirm = await Dialog.confirm({
                title: "Finalizar Rascunho",
                content: `<p>Deseja Finalizar o Rascunho e Iniciar o Desenho Definitivo?</p>`
            });
            if (confirm) {
                let listaProjetos = actor.getFlag("professions-reworked-5e", "projetos") || [];
                if (listaProjetos[index]) {
                    listaProjetos[index].fase = "definitivo";
                    listaProjetos[index].dificuldadeEspecifica = "Difícil";
                }
                await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
            }
        });

        html.find('.resume-draft-btn').click(async (ev) => {
            ev.stopPropagation();
            salvarScroll();
            const card = ev.currentTarget.closest('.project-card');
            const index = card.dataset.index;
            const confirm = await Dialog.confirm({
                title: "Retomar Rascunho",
                content: `<p>Deseja pausar o Desenho Definitivo e Retomar o Rascunho?</p>`
            });
            if (confirm) {
                let listaProjetos = actor.getFlag("professions-reworked-5e", "projetos") || [];
                if (listaProjetos[index]) {
                    const proj = listaProjetos[index];
                    proj.fase = "rascunho";
                    proj.dificuldadeEspecifica = CARTOGRAFO_BIOMA_DIFF[proj.bioma] || "Selecione Bioma";
                }
                await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
            }
        });

        html.find('.conclude-map-btn').click(async (ev) => {
            ev.stopPropagation();
            salvarScroll();
            const card = ev.currentTarget.closest('.project-card');
            const index = card.dataset.index;
            const confirm = await Dialog.confirm({
                title: "Concluir Mapa",
                content: `<p>Deseja Concluir a elaboração deste Mapa e receber suas recompensas?</p>`
            });
            if (confirm) {
                let listaProjetos = actor.getFlag("professions-reworked-5e", "projetos") || [];
                if (listaProjetos[index]) {
                    const proj = listaProjetos[index];
                    proj.isConcluido = true;
                    proj.dataConclusao = Date.now();
                }
                await actor.setFlag("professions-reworked-5e", "projetos", listaProjetos);
            }
        });
    }
};
