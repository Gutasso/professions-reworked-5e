import { ALQUIMISTA_POCAO } from '../constants.js';

export const Alquimista = {
    nome: "Alquimista",

    atualizarDropdown(container) {
        const subTipo = container.find('.new-project-subtype');
        const complexity = container.find('.new-project-complexity');
        if (!subTipo.length) return;

        const val = subTipo.val();
        if (val === "Item de Aventureiro") {
            complexity.html('<option value="Simples">Simples</option>');
            complexity.prop('disabled', true);
        } else if (val === "Poção") {
            let options = '';
            for (const [rarity, config] of Object.entries(ALQUIMISTA_POCAO)) {
                options += `<option value="${rarity}">${rarity}</option>`;
            }
            complexity.html(options);
            complexity.prop('disabled', false);
        } else {
            complexity.html(`
                <option value="Simples">Simples</option>
                <option value="Moderadamente Complexo">Moderado</option>
                <option value="Complexo">Complexo</option>
                <option value="Muito Complexo">Muito Complexo</option>
            `);
            complexity.prop('disabled', false);
        }
    },

    onCreateProject(projectData, container, { actor }) {
        const subTipo = projectData.subTipo;
        let valorComplexidade = container.find('.new-project-complexity').val();

        if (subTipo === "Poção") {
            projectData.raridade = valorComplexidade;
            const configPocao = ALQUIMISTA_POCAO[valorComplexidade];
            if (configPocao) {
                projectData.dificuldadeEspecifica = configPocao.dificuldade;
                projectData.complexidade = configPocao.complexidade;
            }
        }
        return true;
    },

    prepareProject(projeto, comp, { actor }) {
        if (projeto.subTipo === "Poção" && projeto.raridade) {
            const diffDisplay = projeto.dificuldadeEspecifica || comp.dificuldade;
            return {
                infoExtra: ` (${projeto.raridade} - ${diffDisplay} - ${projeto.complexidade})`
            };
        }
        if (projeto.subTipo === "Item de Aventureiro" && projeto.complexidade) {
            return {
                infoExtra: ` (${projeto.complexidade} - ${projeto.dificuldadeEspecifica || comp.dificuldade})`
            };
        }
        return null;
    }
};
