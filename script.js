// VARIÁVEL GLOBAL PARA GUARDAR OS DADOS DO JOGO CARREGADO
let quizDadosAtivos = null;
let nomeDoJogador = "";

/**
 * Função para navegar pelas telas do aplicativo de forma animada
 */
function mudarTela(idTela) {
    // Esconde todas as seções que possuem a classe 'screen'
    document.querySelectorAll('.screen').forEach(tela => {
        tela.classList.remove('active');
    });
    // Mostra apenas a seção solicitada
    document.getElementById(idTela).classList.add('active');
    window.scrollTo(0, 0);
}

/**
 * PAINEL DO PROFESSOR: Captura os dados e gera o código da sala
 */
function criarCodigoQuiz() {
    const titulo = document.getElementById('tituloQuiz').value.trim();
    const pergunta = document.getElementById('perguntaInput').value.trim();
    const optA = document.getElementById('opcA').value.trim();
    const optB = document.getElementById('opcB').value.trim();
    const optC = document.getElementById('opcC').value.trim();
    const respostaCorreta = document.getElementById('correta').value;

    // Validação robusta para impedir campos em branco
    if (!titulo || !pergunta || !optA || !optB || !optC || !respostaCorreta) {
        alert("⚠️ Atenção Professor: Todos os campos do questionário precisam ser preenchidos para gerar o jogo!");
        return;
    }

    // Estrutura o objeto do Quiz
    const pacoteQuiz = {
        titulo: titulo,
        pergunta: pergunta,
        a: optA,
        b: optB,
        c: optC,
        resposta: respostaCorreta
    };

    // Converte o objeto para texto JSON e depois codifica em Base64 para gerar o código da sala
    const jsonTexto = JSON.stringify(pacoteQuiz);
    const codigoPronto = btoa(unescape(encodeURIComponent(jsonTexto)));

    // Insere o código na tela e muda de página
    document.getElementById('codigoGerado').value = codigoPronto;
    mudarTela('tela-codigo-gerado');

    // Limpa o formulário do professor para uma próxima criação
    document.getElementById('tituloQuiz').value = '';
    document.getElementById('perguntaInput').value = '';
    document.getElementById('opcA').value = '';
    document.getElementById('opcB').value = '';
    document.getElementById('opcC').value = '';
    document.getElementById('correta').value = '';
}

/**
 * Função utilitária para copiar o código gerado para a área de transferência do computador/celular
 */
function copiarCodigoTexto() {
    const campoTexto = document.getElementById('codigoGerado');
    campoTexto.select();
    campoTexto.setSelectionRange(0, 99999); // Para dispositivos móveis
    navigator.clipboard.writeText(campoTexto.value);
    alert("📋 Código da sala copiado com sucesso! Agora envie para os seus alunos.");
}

/**
 * ÁREA DO ALUNO: Valida os dados de entrada e reconstrói o jogo a partir do código
 */
function conectarAoQuiz() {
    nomeDoJogador = document.getElementById('nomeAluno').value.trim();
    const codigoSalvo = document.getElementById('codigoInput').value.trim();

    if (!nomeDoJogador) {
        alert("🎒 Por favor, digite seu nome para que o professor possa te identificar.");
        return;
    }
    if (!codigoSalvo) {
        alert("🔑 Por favor, insira o código da sala enviado pelo seu professor.");
        return;
    }

    try {
        // Realiza a decodificação reversa do Base64 e reconstrói o objeto original
        const dadosDecodificados = JSON.parse(decodeURIComponent(escape(atob(codigoSalvo))));
        quizDadosAtivos = dadosDecodificados;

        // Atualiza os textos da interface do jogo do aluno
        document.getElementById('nomeJogadorBadge').innerText = `Aluno: ${nomeDoJogador}`;
        document.getElementById('tituloQuizBadge').innerText = quizDadosAtivos.titulo;
        
        document.getElementById('txtPergunta').innerText = quizDadosAtivos.pergunta;
        document.getElementById('txtOptA').innerText = quizDadosAtivos.a;
        document.getElementById('txtOptB').innerText = quizDadosAtivos.b;
        document.getElementById('txtOptC').innerText = quizDadosAtivos.c;

        // Reseta os estilos visuais dos botões de respostas (remove cores de acerto/erro anteriores)
        const botoes = ['btnOptA', 'btnOptB', 'btnOptC'];
        botoes.forEach(id => {
            const btn = document.getElementById(id);
            btn.classList.remove('correto-style', 'errado-style');
            btn.disabled = false; // Reativa os botões para o novo jogo
        });

        // Entra na arena do jogo
        mudarTela('tela-jogo');
    } catch (e) {
        alert("❌ Código inválido ou corrompido! Peça o código correto ao seu professor.");
    }
}

/**
 * ÁREA DO ALUNO: Valida a escolha do aluno, dá o feedback interativo e calcula a nota
 */
function enviarRespostaAluno(alternativaEscolhida) {
    const respostaCerta = quizDadosAtivos.resposta;
    
    const botoesMapeados = {
        'A': 'btnOptA',
        'B': 'btnOptB',
        'C': 'btnOptC'
    };

    // Desabilita todos os botões após o clique para o aluno não clicar duas vezes
    Object.values(botoesMapeados).forEach(id => {
        document.getElementById(id).disabled = true;
    });

    let notaFinal = 0;
    const iconeContainer = document.getElementById('resultadoIcone');
    const tituloResultado = document.getElementById('resultadoTitulo');
    const txtMensagem = document.getElementById('resultadoMensagem');
    const campoNota = document.getElementById('notaValor');

    // Se o aluno acertou
    if (alternativaEscolhida === respostaCerta) {
        document.getElementById(botoesMapeados[alternativaEscolhida]).classList.add('correto-style');
        notaFinal = 10;
        
        iconeContainer.innerText = "🏆";
        tituloResultado.innerText = "Excelente trabalho!";
        tituloResultado.style.color = "var(--color-sucesso)";
        txtMensagem.innerText = `Parabéns, ${nomeDoJogador}! Você domina o assunto e obteve aproveitamento máximo neste Quiz.`;
    } 
    // Se o aluno errou
    else {
        document.getElementById(botoesMapeados[alternativaEscolhida]).classList.add('errado-style');
        // Destaca em verde qual era a alternativa correta para gerar aprendizado
        document.getElementById(botoesMapeados[respostaCerta]).classList.add('correto-style');
        notaFinal = 0;

        iconeContainer.innerText = "❌";
        tituloResultado.innerText = "Não foi dessa vez!";
        tituloResultado.style.color = "var(--color-erro)";
        txtMensagem.innerText = `${nomeDoJogador}, você marcou a alternativa ${alternativaEscolhida}, mas a resposta correta era a ${respostaCerta}. Continue estudando!`;
    }

    campoNota.innerText = `${notaFinal} / 10`;

    // Aguarda 2 segundos com o feedback na tela antes de levar para a tela de nota final
    setTimeout(() => {
        mudarTela('tela-resultado');
        // Limpa o input de código para segurança
        document.getElementById('codigoInput').value = '';
    }, 2000);
}
