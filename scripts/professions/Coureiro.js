import { COUREIRO_ARMADURA, COUREIRO_ARMA, PREPARO_ENCANTAMENTO, COMPLEXIDADE_PROJETO } from '../constants.js';

export const Coureiro = {
    nome: "Coureiro",

    atualizarDropdown(container) {
        const s = container.find('.new-project-subtype');
        const x = container.find('.new-project-complexity');
        const r = container.find('.new-project-rarity');
        if (!s.length) return;

        const v = s.val();
        r.hide();
        x.prop('disabled', false);

        if (v === "Item de Aventureiro") {
            x.html('<option value="Simples">Simples</option>');
            x.prop('disabled', true);
        } else if (v === "Armadura de Couro") {
            let o = '';
            for (const [t, k] of Object.entries(COUREIRO_ARMADURA)) {
                o += `<option value="${t}">${t}</option>`;
            }
            x.html(o);
        } else if (v === "Arma de Couro") {
            let o = '';
            for (const [t, k] of Object.entries(COUREIRO_ARMA)) {
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

        if (subTipo === "Armadura de Couro") {
            projectData.tipoArmadura = valorComplexidade;
            const config = COUREIRO_ARMADURA[valorComplexidade];
            if (config) {
                projectData.complexidade = config.complexidade;
            }
        } else if (subTipo === "Arma de Couro") {
            projectData.tipoArma = valorComplexidade;
            const config = COUREIRO_ARMA[valorComplexidade];
            if (config) {
                projectData.complexidade = config.complexidade;
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
        if (projeto.subTipo === "Armadura de Couro" && projeto.tipoArmadura) {
            return {
                infoExtra: ` (${projeto.tipoArmadura} - ${projeto.complexidade} - ${projeto.dificuldadeEspecifica || (comp ? comp.dificuldade : "N/A")})`
            };
        }
        if (projeto.subTipo === "Arma de Couro" && projeto.tipoArma) {
            return {
                infoExtra: ` (${projeto.tipoArma} - ${projeto.complexidade} - ${projeto.dificuldadeEspecifica || (comp ? comp.dificuldade : "N/A")})`
            };
        }
        if (projeto.subTipo === "Preparo para Encantamento" && projeto.raridade) {
            return {
                infoExtra: ` (${projeto.raridade} - Base ${projeto.complexidade} - ${projeto.dificuldadeEspecifica})`,
                totalNecessario: projeto.acertosTotaisPreparo || 10
            };
        }
        if (projeto.subTipo === "Conserto") {
            return {
                infoExtra: ` (Conserto - ${projeto.complexidade} - ${projeto.dificuldadeEspecifica || (comp ? comp.dificuldade : "N/A")})`,
                totalNecessario: projeto.acertosTotaisPreparo || 5
            };
        }
        if (projeto.subTipo === "Item de Aventureiro") {
            return {
                infoExtra: ` (${projeto.complexidade} - ${projeto.dificuldadeEspecifica || (comp ? comp.dificuldade : "N/A")})`
            };
        }
        if (projeto.subTipo === "Item de Couro") {
            return {
                infoExtra: ` (${projeto.complexidade} - ${projeto.dificuldadeEspecifica || (comp ? comp.dificuldade : "N/A")})`
            };
        }
        return null;
    }
};
