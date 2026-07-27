import { FERREIRO_ARMADURA, FERREIRO_ARMA, PREPARO_ENCANTAMENTO, COMPLEXIDADE_PROJETO } from '../constants.js';

export const Ferreiro = {
    name: "Ferreiro",

    atualizarDropdown(container) {
        const s = container.find('.new-project-subtype');
        const x = container.find('.new-project-complexity');
        const r = container.find('.new-project-rarity');
        const p = container.find('.plate-toggle-container');
        if (!s.length) return;

        const v = s.val();
        r.hide();
        p.hide();
        x.prop('disabled', false);

        if (v === "Item de Aventureiro") {
            x.html('<option value="Simples">Simples</option>');
            x.prop('disabled', true);
        } else if (v === "Armadura de Metal") {
            let o = '';
            for (const [t, k] of Object.entries(FERREIRO_ARMADURA)) {
                o += `<option value="${t}">${t}</option>`;
            }
            x.html(o);
        } else if (v === "Arma de Metal") {
            let o = '';
            for (const [t, k] of Object.entries(FERREIRO_ARMA)) {
                o += `<option value="${t}">${t}</option>`;
            }
            x.html(o);
        } else if (v === "Preparo para Encantamento") {
            r.show();
            x.html(`
                <option value="Simples">Base Simples</option>
                <option value="Moderadamente Complexo">Base Moderada</option>
                <option value="Complexo">Base Complexa</option>
                <option value="Muito Complexo">Base Muito Complexa</option>
            `);
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
        const isPlateChecked = container.find('.plate-check').is(':checked');

        if (subTipo === "Arma de Metal") {
            projectData.tipoArma = valorComplexidade;
            const config = FERREIRO_ARMA[valorComplexidade];
            if (config) {
                projectData.complexidade = config.complexidade;
            }
        } else if (subTipo === "Armadura de Metal") {
            projectData.tipoArmadura = valorComplexidade;
            if (valorComplexidade === "Armadura Pesada" && isPlateChecked) {
                projectData.complexidade = "Muito Complexo";
                projectData.tipoArmadura += " (Placas)";
            } else {
                const config = FERREIRO_ARMADURA[valorComplexidade];
                if (config) {
                    projectData.complexidade = config.complexidade;
                }
            }
        } else if (subTipo === "Conserto") {
            const configComp = COMPLEXIDADE_PROJETO[valorComplexidade];
            if (configComp) {
                projectData.acertosTotaisPreparo = Math.ceil(configComp.acertosNecessarios / 2);
            }
        } else if (subTipo === "Preparo para Encantamento") {
            if (!valorRaridadePreparo) {
                ui.notifications.warn("Selecione a Raridade do Encanto!");
                return false;
            }
            projectData.raridade = valorRaridadePreparo;
            if (PREPARO_ENCANTAMENTO[valorRaridadePreparo] && PREPARO_ENCANTAMENTO[valorRaridadePreparo][valorComplexidade]) {
                projectData.acertosTotaisPreparo = PREPARO_ENCANTAMENTO[valorRaridadePreparo][valorComplexidade];
            } else {
                projectData.acertosTotaisPreparo = 10;
            }
            projectData.dificuldadeEspecifica = "Muito Difícil";
        }
        return true;
    },

    prepareProject(projeto, comp, { actor }) {
        if (projeto.subTipo === "Arma de Metal" && projeto.tipoArma) {
            return {
                infoExtra: ` (${projeto.tipoArma} - ${projeto.dificuldadeEspecifica || comp.dificuldade} - ${projeto.complexidade})`
            };
        }
        if (projeto.subTipo === "Armadura de Metal" && projeto.tipoArmadura) {
            return {
                infoExtra: ` (${projeto.tipoArmadura} - ${projeto.dificuldadeEspecifica || comp.dificuldade} - ${projeto.complexidade})`
            };
        }
        if (projeto.subTipo === "Preparo para Encantamento" && projeto.raridade) {
            return {
                infoExtra: ` (Preparo: ${projeto.raridade} / Base ${projeto.complexidade})`,
                totalNecessario: projeto.acertosTotaisPreparo || 10
            };
        }
        if (projeto.subTipo === "Conserto") {
            return {
                infoExtra: ` (Conserto - ${projeto.complexidade})`,
                totalNecessario: projeto.acertosTotaisPreparo || 10
            };
        }
        return null;
    },

    registerListeners(html, actor, { salvarScroll }) {
        // Mostra o checkbox de armadura de placas quando armadura pesada é selecionada
        html.find('.new-project-complexity').change(ev => {
            const container = $(ev.currentTarget).closest('.project-creation-form');
            const profSection = container.closest('.profession-section');
            if (profSection.data('prof') === "Ferreiro") {
                const val = $(ev.currentTarget).val();
                const plateToggle = container.find('.plate-toggle-container');
                if (val === "Armadura Pesada") {
                    plateToggle.show();
                    plateToggle.css('display', 'flex');
                } else {
                    plateToggle.hide();
                }
            }
        });
    }
};
