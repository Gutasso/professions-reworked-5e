import { HERBALISTA_BIOMAS, HERBALISTA_MATRIZ, HERBALISTA_META } from '../constants.js';

export const Herbalista = {
    nome: "Herbalista",

    atualizarDropdown(container) {
        const s = container.find('.new-project-subtype');
        const x = container.find('.new-project-complexity');
        const r = container.find('.new-project-rarity');
        if (!s.length) return;

        const v = s.val();
        r.hide();
        x.hide(); // Herbalista oculta complexidade manual

        if (v === "Tintura Mágica") {
            r.show();
        }
    },

    onCreateProject(projectData, container, { actor }) {
        const subTipo = projectData.subTipo;
        const valorRaridadePreparo = container.find('.new-project-rarity').val();

        let metaAcertos = "Simples";
        if (subTipo === "Tintura Mágica") {
            if (!valorRaridadePreparo) {
                ui.notifications.warn("Selecione a Raridade!");
                return false;
            }
            projectData.raridade = valorRaridadePreparo;
            if (valorRaridadePreparo === "Comum") metaAcertos = "Simples";
            else if (valorRaridadePreparo === "Incomum") metaAcertos = "Moderadamente Complexo";
            else if (valorRaridadePreparo === "Raro") metaAcertos = "Complexo";
            else if (valorRaridadePreparo === "Muito Raro") metaAcertos = "Muito Complexo";
            else if (valorRaridadePreparo === "Lendário") metaAcertos = "Muito Complexo";
        } else if (subTipo === "Erva de Poção") {
            metaAcertos = HERBALISTA_META["Erva de Poção"];
        } else {
            metaAcertos = HERBALISTA_META[subTipo] || "Simples";
        }

        projectData.complexidade = metaAcertos;
        projectData.dificuldadeEspecifica = "Selecione Bioma";
        return true;
    },

    onPreRoll(projeto, actor) {
        if (!projeto.bioma) {
            ui.notifications.warn("Selecione o Bioma no card do projeto!");
            return false;
        }
        return true;
    },

    prepareProject(projeto, comp, { actor }) {
        const diffDisplay = projeto.dificuldadeEspecifica || "Selecione Bioma";
        let infoExtra = "";
        if (projeto.raridade) {
            infoExtra = ` (${projeto.raridade} - ${projeto.bioma || "?"} - ${diffDisplay})`;
        } else {
            infoExtra = ` (${projeto.bioma || "?"} - ${diffDisplay})`;
        }

        const sub = projeto.subTipo;
        const rar = projeto.raridade;
        let chaveMatriz = "padrao";

        if (sub === "Erva de Poção") {
            chaveMatriz = "uva";
        } else if (sub === "Tintura Mágica") {
            if (rar === "Comum") chaveMatriz = "comum";
            else if (rar === "Incomum") chaveMatriz = "incomum";
            else if (rar === "Raro") chaveMatriz = "raro";
            else if (rar === "Muito Raro") chaveMatriz = "muito_raro";
            else if (rar === "Lendário") chaveMatriz = "lendario";
        }

        let listaBiomasDinamica = [];
        if (HERBALISTA_MATRIZ[chaveMatriz]) {
            const matrizAlvo = HERBALISTA_MATRIZ[chaveMatriz];
            listaBiomasDinamica = Object.keys(matrizAlvo).filter(bioma => matrizAlvo[bioma] !== null);
        } else {
            listaBiomasDinamica = HERBALISTA_BIOMAS;
        }

        return {
            infoExtra: infoExtra,
            listaBiomas: listaBiomasDinamica
        };
    },

    onBiomeChange(projeto, novoBioma, actor) {
        const sub = projeto.subTipo;
        const rar = projeto.raridade;
        let chaveMatriz = "padrao";

        if (sub === "Erva de Poção") chaveMatriz = "uva";
        else if (sub === "Tintura Mágica") {
            if (rar === "Comum") chaveMatriz = "comum";
            else if (rar === "Incomum") chaveMatriz = "incomum";
            else if (rar === "Raro") chaveMatriz = "raro";
            else if (rar === "Muito Raro") chaveMatriz = "muito_raro";
            else if (rar === "Lendário") chaveMatriz = "lendario";
        }

        const novaDiff = HERBALISTA_MATRIZ[chaveMatriz][novoBioma];
        if (!novaDiff) {
            ui.notifications.warn(`Não é possível encontrar ${sub} em ${novoBioma}!`);
            projeto.bioma = "";
            projeto.dificuldadeEspecifica = "Bioma Inválido";
            return false;
        } else {
            projeto.dificuldadeEspecifica = novaDiff;
            return true;
        }
    },

    registerListeners(html, actor, { salvarScroll }) {
        // Mudança de raridade para Herbalista reconstrói o formulário
        html.find('.new-project-rarity').change(ev => {
            const container = $(ev.currentTarget).closest('.project-creation-form');
            const profSection = container.closest('.profession-section');
            if (profSection.data('prof') === "Herbalista") {
                this.atualizarDropdown(container);
            }
        });
    }
};
