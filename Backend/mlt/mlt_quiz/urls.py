from django.urls import path

# importation des vues
from . import views

urlpatterns = [

    # --- PARTIE PARENT (STATISTIQUES) ---

    # Chemin vers notre vue renvoyant les statistiques globales (total enfants, moyenne générale) pour le dashboard parent
    path('stats-global/', views.ParentGlobalStatsView.as_view(), name='stats-global'),

    # Chemin renvoyant les statistiques détaillées (par thème, temps moyen) pour un enfant spécifique
    path('stats-par-enfant/<int:enfant_id>/', views.EnfantDetailStatsView.as_view(), name='stats-enfant'),

    # --- PARTIE ENFANT (EXERCICES) ---

    # Chemin vers notre vue permettant d'enregistrer le score, le temps et les stats de l'enfant après un quiz
    path('save-score/', views.SaveScoreView.as_view(), name='savescore'),

    path('enfant-dashboard/', views.EnfantDashboardView.as_view(), name='enfant_dashboard'),

    # Calcul écrit : liste de questions indépendantes avec saisie directe (pas de QCM)
    path('calcul-ecrit/', views.GetCalculEcritView.as_view(), name='calcul_ecrit'),

    # Problèmes : UN problème complet avec énoncé global et sous-questions
    path('probleme/', views.GetProblemeView.as_view(), name='probleme'),

    # Chemin vers notre vue permettant de récupérer une liste de questions aléatoires selon le thème et le niveau de l'enfant
    # IMPORTANT : cette route générique doit rester EN DERNIER
    path('<str:theme>/', views.GetQuizView.as_view(), name='quiz'),

]