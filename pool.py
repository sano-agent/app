# -*- coding: utf-8 -*-
"""pool.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/10pr3VNDaCKnPGO3mPYfXOVOvcyhdT6XG
"""

import pandas as pd
import gspread
from google.auth import default
from google.colab import auth
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from math import pi

# Autenticação no Google Colab
auth.authenticate_user()
creds, _ = default()
gc = gspread.authorize(creds)

# Abrir a planilha (substitua pela sua URL)
planilha = gc.open_by_url('https://docs.google.com/spreadsheets/d/1GwjKAuE2RuCsNqjmfSZ5aOTmHYLRjlCwHlE0FeVcpRI/edit?resourcekey=&gid=1314903386')

# Seleciona a aba "Form Responses 1"
aba = planilha.worksheet('Form Responses 1')

# Converte os dados em um DataFrame do pandas
df = pd.DataFrame(aba.get_all_records())

# Lista de ativos
ativos = ['SOUL', 'BEAM', 'CELR', 'XEND', 'FLOW', 'DEXE', 'SBR', 'DBC', 'KYVE']

# Criando um DataFrame para armazenar os resultados
resultados = pd.DataFrame({'Ativo': ativos, 'Total': 4})

# Calculando os totais ponderados com base nas respostas
for ativo in ativos:
    for choice in ['Choice 1', 'Choice 2', 'Choice 3']:
        pontuacao = 4 - int(choice.split()[-1])  # Atribuímos 3 para 'Choice 1', 2 para 'Choice 2', e 1 para 'Choice 3'
        resultados.loc[resultados['Ativo'] == ativo, 'Total'] += (
            (df[f'Rank the 3 assets that appear to be the best choices for short or very short-term investments. [{ativo}]'] == choice).sum() * pontuacao
        )

# Encontrando o ativo vencedor com a maior pontuação
vencedor = resultados.loc[resultados['Total'].idxmax(), 'Ativo']

# Função para plotar gráfico radar com estilo vibrante e moderno
def plot_radar(resultados):
    labels = list(resultados.keys())
    stats = list(resultados.values())

    # Adiciona o primeiro valor no final para fechar o gráfico
    stats += stats[:1]
    labels += labels[:1]

    angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
    stats, angles = np.array(stats), np.array(angles)

    # Organizar o gráfico para ser circular
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))

    # Estilo vibrante com cores neon
    ax.set_facecolor('black')
    ax.fill(angles, stats, color='#00FF7F', alpha=0.4)  # Cor de preenchimento
    ax.plot(angles, stats, color='#00FF7F', linewidth=3)  # Cor da linha

    # Ajustes visuais
    ax.set_yticklabels([])
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(labels[:-1], color='#FFD700', fontsize=14, fontweight='bold')  # Labels em dourado

    for label in ax.get_xticklabels():
        label.set_fontsize(16)

    # Estilo para as grades
    ax.spines['polar'].set_color('#FFD700')
    ax.grid(color='#FFD700', linestyle='--', linewidth=0.75)  # Grade dourada

    plt.show()

# Função para plotar gráfico de barras com estilo vibrante e moderno
def plot_bar(resultados):
    # Organizando o DataFrame do mais votado para o menos votado
    resultados_ordenados = resultados.sort_values(by='Total', ascending=False)

    # Definindo o fundo preto e cores vibrantes
    plt.figure(figsize=(10, 6))
    sns.set(style="whitegrid")

    ax = sns.barplot(x='Ativo', y='Total', data=resultados_ordenados,
                     palette=['#1E90FF', '#FF4500', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2', '#FF6347', '#40E0D0', '#DC143C'])

    # Configuração de fundo preto e labels vibrantes
    ax.set_facecolor('black')
    plt.gcf().set_facecolor('black')
    ax.set_xlabel('Ativo', fontsize=16, color='#1E90FF')  # Texto azul vibrante
    ax.set_ylabel('Pontuação Total', fontsize=16, color='#FF4500')  # Texto laranja vibrante
    ax.set_title('Resultado da Votação STV - Ativos', fontsize=18, color='#FFD700')  # Título dourado

    # Estilo vibrante para os ticks
    ax.tick_params(axis='x', colors='#FF69B4', labelsize=14)
    ax.tick_params(axis='y', colors='#32CD32', labelsize=14)

    # Estilo vibrante para as bordas
    ax.spines['top'].set_color('#FF6347')
    ax.spines['bottom'].set_color('#FF6347')
    ax.spines['left'].set_color('#FF6347')
    ax.spines['right'].set_color('#FF6347')

    # Grade vibrante
    ax.grid(True, which='major', axis='y', color='#FFD700', linestyle='--', linewidth=0.75)

    plt.show()

# Plotando os gráficos
plot_radar(resultados.set_index('Ativo')['Total'].to_dict())
plot_bar(resultados)

# Exibindo o vencedor
print(f"Ativo vencedor por voto preferencial: {vencedor}")

# Função para criar um gráfico radar para o participante em destaque
def grafico_teia(df, participante_destaque):
    # Variáveis utilizadas no radar
    variaveis = ['responsabilidade_afetiva', 'independencia', 'coesao_social', 'comunicacao', 'compromisso', 'confiança', 'autocontrole', 'empatia', 'flexibilidade_cognitiva']
    num_variaveis = len(variaveis)

    # Valores do participante em destaque
    valores = df[df['participante'] == participante_destaque][variaveis].values.flatten().tolist()
    valores += valores[:1]  # Fechar o círculo

    # Ângulos para o gráfico radar
    angulos = [n / float(num_variaveis) * 2 * pi for n in range(num_variaveis)]
    angulos += angulos[:1]

    # Estilo do gráfico
    plt.figure(figsize=(8, 8), facecolor='black')
    ax = plt.subplot(111, polar=True)
    ax.set_facecolor('black')

    # Cores vibrantes para o gráfico
    cores_azul_verde = ['#0077B6', '#009688', '#00B4D8', '#48CAE4', '#90E0EF']
    cores_vermelho = ['#FF4C4C', '#FF6F61', '#FF8C69', '#FF9980', '#FFA07A', '#FFB399', '#FFC0CB']  # Tons de vermelho

    # Preenchimento do radar
    ax.fill(angulos, valores, color='#00BFFF', alpha=0.4)
    ax.plot(angulos, valores, color='#00BFFF', linewidth=2)

    # Ajuste dos labels
    ax.set_yticklabels([])
    ax.set_xticks(angulos[:-1])
    ax.set_xticklabels(variaveis, color='#FFD700', fontsize=14, fontweight='bold')  # Labels em dourado

    # Estilo vibrante para as grades
    ax.spines['polar'].set_color('#FFD700')
    ax.grid(color='#FFD700', linestyle='--', linewidth=0.75)

    plt.show()