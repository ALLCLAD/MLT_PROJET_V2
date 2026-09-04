import json, os, random
from django.conf import settings
from httpcore import request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import ScoreQuizSerializer
from django.db.models import Avg, Count, ExpressionWrapper, FloatField, F
from Uauth.models import Enfant, SuiviParentEnfant
from .models import ScoreQuiz, ThemeQuiz
import traceback
from django.utils import timezone
from datetime import timedelta, date
from django.db.models import Sum, Max

class GetQuizView(APIView):
    """
    Fournit un quiz adapté au niveau de l'enfant qui le demande.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, theme):
        try:
            # 1. Vérification que l'utilisateur est bien un enfant
            enfant = request.user.profil_enfant
            classe = enfant.classe
            if request.user.role != 'ENFANT':
                return Response({"error": "Réservé aux enfants"}, status=403)
                
            # 2. Adaptation du nombre de questions selon sa classe
            if theme.upper() == 'CALCUL_MENTAL':
                nb_questions = 5
            else:
                if classe in ['CP1', 'CP2']: nb_questions = 5
                elif classe in ['CE1', 'CE2']: nb_questions = 10
                else: nb_questions = 15
            
            # 3. Récupération des questions depuis le fichier JSON correspondant
            file_path = os.path.join(settings.BASE_DIR, 'data', 'exercices', classe, f"{theme.upper()}.json")
            if not os.path.exists(file_path):
                return Response({"error": "Fichier non trouvé"}, status=status.HTTP_404_NOT_FOUND)
                
            with open(file_path, 'r', encoding="utf-8") as f:
                all_questions = json.load(f)
                
            # 4. Mélange et envoi d'une sélection de questions
            random.shuffle(all_questions)
            return Response({"question": all_questions[:nb_questions]}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GetCalculEcritView(APIView):
    """
    Fournit une liste d'exercices de calcul écrit adaptés au niveau de l'enfant.
    Les questions sont indépendantes, l'enfant saisit directement sa réponse (pas de QCM).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            enfant = request.user.profil_enfant
            classe = enfant.classe
            if request.user.role != 'ENFANT':
                return Response({"error": "Réservé aux enfants"}, status=403)

            # Nombre de calculs selon le niveau
            nb_questions = 5

            file_path = os.path.join(settings.BASE_DIR, 'data', 'exercices', classe, 'calcul_ecrit.json')
            if not os.path.exists(file_path):
                return Response({"error": "Fichier calcul_ecrit non trouvé pour ce niveau"}, status=404)

            with open(file_path, 'r', encoding='utf-8') as f:
                all_questions = json.load(f)

            random.shuffle(all_questions)
            questions = all_questions[:nb_questions]

            # On ajoute le type pour que le frontend sache comment afficher ces questions
            for q in questions:
                q['type'] = 'CALCUL_ECRIT'

            return Response({"questions": questions, "type": "CALCUL_ECRIT"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class GetProblemeView(APIView):
    """
    Fournit UN problème complet (énoncé global + toutes ses sous-questions) adapté au niveau de l'enfant.
    Le frontend affiche tout sur une seule page avec un timer global.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            enfant = request.user.profil_enfant
            classe = enfant.classe
            if request.user.role != 'ENFANT':
                return Response({"error": "Réservé aux enfants"}, status=403)

            file_path = os.path.join(settings.BASE_DIR, 'data', 'exercices', classe, 'probleme.json')
            if not os.path.exists(file_path):
                return Response({"error": "Fichier probleme non trouvé pour ce niveau"}, status=404)

            with open(file_path, 'r', encoding='utf-8') as f:
                all_problemes = json.load(f)

            # On sélectionne UN problème aléatoire et on le renvoie complet
            probleme = random.choice(all_problemes)
            probleme['type'] = 'PROBLEME'

            return Response({"probleme": probleme}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class SaveScoreView(APIView):
    """
    Sauvegarde le score d'un enfant après avoir terminé un quiz.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        data = request.data.copy()
        if 'theme' in data and isinstance(data['theme'], str):
            data['theme'] = data['theme'].upper()
        serializer = ScoreQuizSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Bravo ! Ton score a été enregistré."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ParentGlobalStatsView(APIView):
    """
    Affiche la vue globale du tableau de bord d'un parent (tous ses enfants).
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # 1. Trouver les enfants surveillés par ce parent
            suivis = SuiviParentEnfant.objects.filter(parent__utilisateur=request.user)
            if not suivis.exists():
                return Response({"totalEnfants": 0, "exercicesTermines": 0, "moyenneGenerale": 0, "recentActivity": [], "graphData": []})
                
            enfants_ids = suivis.values_list('enfant_id', flat=True)
            enfants = [s.enfant for s in suivis]
            scores = ScoreQuiz.objects.filter(enfant_id__in=enfants_ids)
            
            # 2. Calculer la moyenne générale
            stats_globales = scores.aggregate(moyenne=Avg(ExpressionWrapper(F('points') * 20.0 / F('total_questions'), output_field=FloatField())))
            moyenne_val = round(stats_globales['moyenne'] or 0, 1)
            
            # 3. Préparer les données pour le graphique (activité des 7 derniers jours)
            jours_labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
            today = timezone.now().date()
            start_of_week = today - timedelta(days=today.weekday())
            
            graph_data = []
            for i in range(7):
                date_cible = start_of_week + timedelta(days=i)
                entry = {"name": jours_labels[i]}
                # On compte le nombre d'exercices par jour et par enfant
                for enf in enfants:
                    count = scores.filter(enfant=enf, date_realisation=date_cible).count()
                    entry[enf.utilisateur.first_name] = count
                graph_data.append(entry)
                
            # 4. Historique bref des 3 dernières activités
            recent_scores = scores.select_related('enfant__utilisateur').order_by('-id')[:3]
            recent_activity = [{"prenom": s.enfant.utilisateur.first_name, "theme": s.get_theme_display(), "score": round((s.points / s.total_questions) * 20, 1) if s.total_questions else 0, "date": s.date_realisation} for s in recent_scores]
            
            return Response({"totalEnfants": suivis.count(), "exercicesTermines": scores.count(), "moyenneGenerale": moyenne_val, "recentActivity": recent_activity, "graphData": graph_data})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class EnfantDetailStatsView(APIView):
    """
    Affiche les statistiques détaillées (graphiques, maîtrises) d'un enfant spécifique pour son parent.
    **Cette fonctionnalité est partagée de façon identique avec le côté Enseignant.**
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, enfant_id):
        try:
            # Sécurité : Un parent ne peut voir que SES enfants
            SuiviParentEnfant.objects.get(parent__utilisateur=request.user, enfant_id=enfant_id)
            enfant = Enfant.objects.get(id=enfant_id)
        except (SuiviParentEnfant.DoesNotExist, Enfant.DoesNotExist):
            return Response({"error": "Accès non autorisé"}, status=status.HTTP_403_FORBIDDEN)
            
        # 1. Calculs des barres de progression de niveau par thème (ex: Maths, Français...)
        stats_themes = ScoreQuiz.objects.filter(enfant=enfant).annotate(
            note_sur_20=ExpressionWrapper(F('points') * 20.0 / F('total_questions'), output_field=FloatField())
        ).values('theme').annotate(moyenne=Avg('note_sur_20'), nb_exercices=Count('id'), temps_moyen=Avg('temps'))
        
        for stat in stats_themes:
            stat['moyenne'] = round(stat['moyenne'], 2)
            stat['temps_moyen'] = round(stat['temps_moyen'] or 0, 1)
            stat['theme_label'] = dict(ThemeQuiz.choices).get(stat['theme'], stat['theme'].capitalize())
            
        # 2. On récupère toute l'histoire des scores de l'enfant
        scores_query = ScoreQuiz.objects.filter(enfant=enfant).order_by('-date_realisation', '-id')
        historique = [{"id": s.id, "theme": s.get_theme_display(), "note": round((s.points / s.total_questions) * 20, 1), "date": s.date_realisation, "points": s.points, "total": s.total_questions} for s in scores_query]
        
        # 3. Préparation du 1er graphique: L'évolution de ses notes. 
        progression_notes = [{"date": s.date_realisation.strftime("%d/%m"), "note": round((s.points / s.total_questions) * 20, 1), "theme": s.get_theme_display()} for s in reversed(scores_query[:20])]
        
        # 4. Préparation du 2nd graphique: Nombre de Quiz terminés cette semaine.
        jours_labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
        start_of_week = timezone.now().date() - timedelta(days=timezone.now().date().weekday())
        progression_exercices = []
        for i in range(7):
            count = scores_query.filter(date_realisation=start_of_week + timedelta(days=i)).count()
            progression_exercices.append({"name": jours_labels[i], "count": count})
            
        # 5. On renvoie tous ces tableaux combinés au frontend
        return Response({"enfant": f"{enfant.utilisateur.first_name} {enfant.utilisateur.last_name}", "classe": enfant.classe, "stats_par_theme": list(stats_themes), "historique": historique, "progression_notes": progression_notes, "progression_exercices": progression_exercices}, status=status.HTTP_200_OK)

class EnfantDashboardView(APIView):
    """
    Vue principale du profil de l'enfant lui-même.
    Retourne : prénom, niveau, xp (0-99), streak, totalEtoiles, dernierScore (sur 20).
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            enfant = Enfant.objects.filter(utilisateur=request.user).first()
            if not enfant:
                return Response({"error": "Profil enfant non trouvé"}, status=404)

            scores = ScoreQuiz.objects.filter(enfant=enfant).order_by('-date_realisation', '-id')

            # ── XP & NIVEAU ──────────────────────────────────────────────────
            total_xp = 0
            total_etoiles_brut = 0
            for s in scores:
                if s.total_questions > 0:
                    note_sur_20 = round((s.points / s.total_questions) * 20, 1)
                    total_xp += note_sur_20
                total_etoiles_brut += s.points

            niveau = int(total_xp // 100) + 1
            xp_dans_niveau = round(total_xp % 100, 1)

            # ── STREAK & CALENDRIER HEBDOMADAIRE ──────────────────────────────
            today = timezone.now().date()
            check_date = today
            streak = 0
            if not scores.filter(date_realisation=check_date).exists():
                check_date -= timedelta(days=1)
            while scores.filter(date_realisation=check_date).exists():
                streak += 1
                check_date -= timedelta(days=1)

            # ── DERNIER SCORE (normalisé sur 20) ─────────────────────────────
            dernier = scores.first()
            if dernier and dernier.total_questions > 0:
                dernier_score = round((dernier.points / dernier.total_questions) * 20, 1)
            else:
                dernier_score = 0

            # ── CALENDRIER HEBDOMADAIRE (Jours actifs cette semaine) ──────────
            start_of_week = today - timedelta(days=today.weekday())
            # Jours où l'enfant a réalisé au moins un exercice cette semaine
            active_dates = set(
                scores.filter(date_realisation__gte=start_of_week, date_realisation__lte=today)
                .values_list('date_realisation', flat=True)
            )
            # Tableau de 7 booléens pour Lun..Dim
            active_dates_week = [
                (start_of_week + timedelta(days=i)) in active_dates
                for i in range(7)
            ]

            return Response({
                "prenom":             request.user.first_name or request.user.username,
                "niveau":             niveau,
                "xp":                 xp_dans_niveau,
                "streak":             streak,
                "totalEtoiles":       total_etoiles_brut,
                "dernierScore":       dernier_score,
                "active_dates_week":  active_dates_week,
                "total_exercices":    scores.count(),
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

