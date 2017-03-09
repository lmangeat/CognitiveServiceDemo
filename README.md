CognitiveServiceDemo (et Twitter...)
===================


Voici le projet consommant la cognitive API de Microsoft ainsi que l'API de Twitter.
Le projet interroge l'API Text Analytics de Microsoft. Ensuite, il envoie les données reçues de cette API sur un IoTHub sur Microsoft Azure.

Dans la page d'administration, on peut ajouter des devices, en supprimer et sélectionner celui sur le quel on veut que les données soient envoyées.

Enfin, dans la partie Twitter, on peut stream des messages depuis l'API Twitter. En cliquant sur le bouton "Start Stream" on démarre le stream et en cliquant sur "Stop Stream", on le stop.

----------


Administration
-------------

#### <i class="icon-file"></i> Créé un divice

On peut créer un device dans la partie administration.

#### <i class="icon-trash"></i> Delete a document

On peut supprimer un device dans la partie administration.

#### <i class="icon-hdd"></i> Utiliser un device

On peut sélectionner le device sur le quel on veut que l'API Text Analytics envoie les données.


----------


Configuration
-------------------
Pour faire fonctionner le projet, modifier le fichier de conf **`iotHub.json`** avec vos infos Azure :

```
{
  "IoTHub": {
    "HostName": "<Your IoTHub HostName>",
    "SharedAccessKeyName": "<Your IoTHub SharedAccessKeyName>",
    "SharedAccessKey": "<Your IoTHub SharedAccessKey>",
    "connectionString": "<Your IoTHub connectionString>"
  },
  "devices": {
    "default": {
      "deviceId": "<Your Default Device devceId>",
      "connectionString" : "<Your Default Device connectionString>"
    },
    "twitter": {
      "deviceId": "<Your Twitter Device devceId>",
      "connectionString" : "<Your Twitter Device connectionString>"
    }
  }
}
```

Lancement
-------------------
Pour lancer le projet, faire un
```
npm install
npm start
```
L'application tourne sur le port **3500**.
Accéder à l'adresse http://localhost:3500/