import { CARPINTEIRO_ARMA, PREPARO_ENCANTAMENTO } from '../constants.js';

export const Carpinteiro = {
    nome: "Carpinteiro",

    atualizarDropdown(container) {
        const subTipo = container.find('.new-project-subtype');
        const complexity = container.find('.new-project-complexity');
        const rarity = container.find('.new-project-rarity');
        if (!subTipo.length) return;

        const val = subTipo.val();
        rarity.hide();
        complexity.prop('disabled', false);

        if (val === "Item de Aventureiro") {
            complexity.html('<option value="Simples">Simples</option>');
            complexity.prop('disabled', true);
        } else if (val === "Escudo") {
            complexity.html('<option value="Moderadamente Complexo">Moderado</option>');
            complexity.prop('disabled', true);
        } else if (val === "Arma de Madeira") {
            let options = '';
            for (const [t, k] of Object.entries(CARPINTEIRO_ARMA)) {
                options += `<option value="${t}">${t}</option>`;
            }
            complexity.html(options);
        } else if (val === "Preparo para Encantamento") {
            rarity.show();
            complexity.html(`
                <option value="Simples">Base Simples</option>
                <option value="Moderadamente Complexo">Base Moderada</option>
                <option value="Complexo">Base Complexa</option>
                <option value="Muito Complexo">Base Muito Complexa</option>
            `);
        } else {
            complexity.html(`
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

        if (subTipo === "Arma de Madeira") {
            projectData.tipoArma = valorComplexidade;
            const configArma = CARPINTEIRO_ARMA[valorComplexidade];
            if (configArma) {
                projectData.complexidade = configArma.complexidade;
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
        if (projeto.subTipo === "Arma de Madeira" && projeto.tipoArma) {
            return {
                infoExtra: ` (Arma ${projeto.tipoArma} - ${projeto.dificuldadeEspecifica || comp.dificuldade} - ${projeto.complexidade})`
            };
        }
        if (projeto.subTipo === "Preparo para Encantamento" && projeto.raridade) {
            return {
                infoExtra: ` (${projeto.raridade} - Base: ${projeto.complexidade} - ${projeto.dificuldadeEspecifica})`,
                totalNecessario: projeto.acertosTotaisPreparo || 10
            };
        }
        if (projeto.subTipo === "Peça de Madeira" && projeto.complexidade) {
            return {
                infoExtra: ` (${projeto.complexidade} - ${projeto.dificuldadeEspecifica || comp.dificuldade})`
            };
        }
        if (projeto.subTipo === "Item de Aventureiro" && projeto.complexidade) {
            return {
                infoExtra: ` (${projeto.complexidade} - ${projeto.dificuldadeEspecifica || comp.dificuldade})`
            };
        }
        if (projeto.subTipo === "Escudo" && projeto.complexidade) {
            return {
                infoExtra: ` (${projeto.complexidade} - ${projeto.dificuldadeEspecifica || comp.dificuldade})`
            };
        }
        return null;
    }
};
