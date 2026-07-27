import { SICARIO_COLETA_DIFF, SICARIO_DOSES } from '../constants.js';

export const Sicario = {
    nome: "Sicário",

    atualizarDropdown(container) {
        const s = container.find('.new-project-subtype');
        const x = container.find('.new-project-complexity');
        const da = container.find('.new-project-dragon-age');
        const pt = container.find('.new-project-poison-type');
        const ht = container.find('.new-project-herb-type');
        if (!s.length) return;

        const v = s.val();
        da.hide();
        pt.hide();
        ht.hide();
        x.show();
        x.prop('disabled', false);

        if (v === "Veneno Básico") {
            x.html('<option value="Simples">Simples</option>');
            x.prop('disabled', true);
        } else if (v === "Veneno Avançado") {
            x.html('<option value="Moderadamente Complexo">Moderado</option>');
            x.prop('disabled', true);
        } else if (v === "Coleta de Veneno de Monstro") {
            pt.show();
            x.hide();
        } else if (v === "Coleta de Erva Venenosa") {
            ht.show();
            x.html('<option value="Simples">Simples</option>');
            x.prop('disabled', true);
        }
    },

    onCreateProject(projectData, container, { actor }) {
        const subTipo = projectData.subTipo;
        let valorComplexidade = container.find('.new-project-complexity').val();
        const valorTipoVeneno = container.find('.new-project-poison-type').val();
        const valorTipoErva = container.find('.new-project-herb-type').val();

        if (subTipo === "Veneno Básico") {
            projectData.complexidade = "Simples";
        } else if (subTipo === "Veneno Avançado") {
            projectData.complexidade = "Moderadamente Complexo";
        } else if (subTipo === "Coleta de Veneno de Monstro") {
            if (!valorTipoVeneno) {
                ui.notifications.warn("Selecione o Tipo de Veneno!");
                return false;
            }
            projectData.tipoVenenoColeta = valorTipoVeneno;
            const configColeta = SICARIO_COLETA_DIFF[valorTipoVeneno];
            if (configColeta) {
                projectData.dificuldadeEspecifica = configColeta.dificuldade;
                projectData.complexidade = "Simples";
            }
        } else if (subTipo === "Coleta de Erva Venenosa") {
            if (!valorTipoErva) {
                ui.notifications.warn("Selecione o Tipo de Erva!");
                return false;
            }
            projectData.tipoErva = valorTipoErva;
            if (valorTipoErva === "Veneno Básico") {
                projectData.complexidade = "Simples";
            } else if (valorTipoErva === "Veneno Avançado") {
                projectData.complexidade = "Moderadamente Complexo";
            }
        }
        return true;
    },

    async handleRoll(projeto, actor, roll, res, cfg, isExpertise) {
        let detalhesResultado = "";

        if (projeto.subTipo === "Coleta de Veneno de Monstro") {
            const formulaDoses = SICARIO_DOSES[res.resultado];
            let textoDoses = "";
            if (formulaDoses === "0") {
                projeto.resultadoColeta = "Nenhuma dose coletada.";
                textoDoses = "Nenhuma dose coletada.";
            } else {
                const rollDoses = new Roll(formulaDoses);
                await rollDoses.evaluate();
                projeto.resultadoColeta = `${rollDoses.total} Doses (${formulaDoses})`;
                textoDoses = `<strong>${rollDoses.total}</strong> Doses coletadas!`;
            }
            projeto.isConcluido = true; 
            projeto.dataConclusao = Date.now();
            detalhesResultado = `<div style="font-size: 14px; font-weight: bold; color: ${cfg.color};">${textoDoses}</div>`;
        }
        return detalhesResultado;
    },

    prepareProject(projeto, comp, { actor }) {
        if (projeto.subTipo === "Coleta de Veneno de Monstro") {
            return {
                infoExtra: ` (${projeto.tipoVenenoColeta} - ${projeto.dificuldadeEspecifica})`
            };
        }
        if (projeto.subTipo === "Coleta de Erva Venenosa") {
            const diffDisplay = projeto.dificuldadeEspecifica || comp.dificuldade;
            return {
                infoExtra: ` (${projeto.tipoErva} - ${diffDisplay} - ${projeto.complexidade})`
            };
        }
        return null;
    },

    registerListeners(html, actor, { salvarScroll }) {
        const $html = $(html);
        $html.find('.new-project-herb-type').change(ev => {
            const container = $(ev.currentTarget).closest('.project-creation-form');
            const val = $(ev.currentTarget).val();
            const compSelect = container.find('.new-project-complexity');
            if (val === "Veneno Básico") {
                compSelect.html('<option value="Simples">Simples</option>');
            } else if (val === "Veneno Avançado") {
                compSelect.html('<option value="Moderadamente Complexo">Moderado</option>');
            }
        });
    }
};
