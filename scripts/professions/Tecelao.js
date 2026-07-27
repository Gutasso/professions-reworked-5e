import { PREPARO_ENCANTAMENTO, COMPLEXIDADE_PROJETO } from '../constants.js';

export const Tecelao = {
    nome: "Tecelão",

    atualizarDropdown(container) {
        const s = container.find('.new-project-subtype');
        const x = container.find('.new-project-complexity');
        const r = container.find('.new-project-rarity');
        if (!s.length) return;

        const v = s.val();
        r.hide();
        x.prop('disabled', false);
        x.show();

        if (v === "Item de Aventureiro") {
            x.html('<option value="Simples">Simples</option>');
            x.prop('disabled', true);
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

        if (subTipo === "Conserto") {
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
    }
};
