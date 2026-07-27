import { ESCRIBA_PERGAMINHO } from '../constants.js';

export const Escriba = {
    nome: "Escriba",

    atualizarDropdown(container) {
        const s = container.find('.new-project-subtype');
        const x = container.find('.new-project-complexity');
        const r = container.find('.new-project-rarity');
        if (!s.length) return;

        const v = s.val();
        r.hide();
        x.prop('disabled', false);

        if (v === "Pergaminho de Magia") {
            let o = '';
            for (const [k, val] of Object.entries(ESCRIBA_PERGAMINHO)) {
                o += `<option value="${k}">${k}</option>`;
            }
            x.html(o);
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

        if (subTipo === "Cópia de Texto") {
            projectData.dificuldadeEspecifica = "Fácil";
        } else if (subTipo === "Obra de Arte") {
            projectData.dificuldadeEspecifica = "Difícil";
        } else if (subTipo === "Escrita de Livro") {
            projectData.dificuldadeEspecifica = "Médio";
        } else if (subTipo === "Pergaminho de Magia") {
            projectData.raridade = valorComplexidade;
            const configPergaminho = ESCRIBA_PERGAMINHO[valorComplexidade];
            if (configPergaminho) {
                projectData.dificuldadeEspecifica = configPergaminho.dificuldade;
                projectData.complexidade = configPergaminho.complexidade;
            }
        }
        return true;
    },

    prepareProject(projeto, comp, { actor }) {
        if (projeto.subTipo === "Pergaminho de Magia" && projeto.raridade) {
            const diffDisplay = projeto.dificuldadeEspecifica || (comp ? comp.dificuldade : "N/A");
            return {
                infoExtra: ` (${projeto.raridade} - ${diffDisplay} - ${projeto.complexidade})`
            };
        }
        if (projeto.subTipo === "Cópia de Texto" && projeto.complexidade) {
            return {
                infoExtra: ` (${projeto.complexidade} - ${projeto.dificuldadeEspecifica || "Fácil"})`
            };
        }
        if (projeto.subTipo === "Obra de Arte" && projeto.complexidade) {
            return {
                infoExtra: ` (${projeto.complexidade} - ${projeto.dificuldadeEspecifica || "Difícil"})`
            };
        }
        if (projeto.subTipo === "Escrita de Livro" && projeto.complexidade) {
            return {
                infoExtra: ` (${projeto.complexidade} - ${projeto.dificuldadeEspecifica || "Médio"})`
            };
        }

        return null;
    }
};
