<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nouveau message de contact - UBR</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; }
        .urgency-high { border-left: 5px solid #dc2626; background: #fef2f2; }
        .urgency-medium { border-left: 5px solid #f59e0b; background: #fffbeb; }
        .urgency-low { border-left: 5px solid #10b981; background: #f0fdf4; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤍 UBR - Nouveau message de contact</h1>
        </div>
        
        <div class="content urgency-{{ $urgency }}">
            <h2>Détails du message</h2>
            
            <p><strong>Nom :</strong> {{ $name }}</p>
            <p><strong>Email :</strong> {{ $email }}</p>
            <p><strong>Sujet :</strong> {{ $subject }}</p>
            <p><strong>Urgence :</strong> 
                @if($urgency === 'high')
                    🚨 Élevée
                @elseif($urgency === 'medium')
                    ⚠️ Moyenne
                @else
                    ✅ Faible
                @endif
            </p>
            <p><strong>Date :</strong> {{ now()->format('d/m/Y à H:i') }}</p>
            
            <h3>Message :</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb;">
                {!! nl2br(e($message)) !!}
            </div>
            
            @if($urgency === 'high')
                <div style="margin-top: 20px; padding: 15px; background: #dc2626; color: white; border-radius: 5px;">
                    <strong>⚠️ ATTENTION : Message urgent</strong><br>
                    Ce message nécessite une réponse prioritaire dans les plus brefs délais.
                </div>
            @endif
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            © {{ date('Y') }} UBR - Union Bénie et Réelle. Tous droits réservés.
        </div>
    </div>
</body>
</html>