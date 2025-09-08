<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Copie de votre message - UBR</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤍 UBR - Copie de votre message</h1>
        </div>
        
        <div class="content">
            <p>Bonjour {{ $name }},</p>
            
            <p>Nous avons bien reçu votre message et vous en remercions. Voici une copie pour vos archives :</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb; margin: 20px 0;">
                <p><strong>Sujet :</strong> {{ $subject }}</p>
                <p><strong>Message :</strong></p>
                <div style="margin-top: 10px;">
                    {!! nl2br(e($message)) !!}
                </div>
            </div>
            
            <p>Notre équipe vous répondra dans les plus brefs délais :</p>
            <ul>
                <li><strong>Urgence élevée :</strong> sous 2 heures</li>
                <li><strong>Urgence moyenne :</strong> sous 24 heures</li>
                <li><strong>Urgence faible :</strong> sous 72 heures</li>
            </ul>
            
            <p>Si vous avez des questions urgentes, n'hésitez pas à nous appeler au +225 07 xx xx xx xx.</p>
            
            <p>Que Dieu vous bénisse,<br>
            L'équipe UBR</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            © {{ date('Y') }} UBR - Union Bénie et Réelle. Tous droits réservés.
        </div>
    </div>
</body>
</html>