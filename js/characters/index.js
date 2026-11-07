// Liste ordonnée des combattants (l'ordre = identifiant). Un dossier par personnage.
import kaitoApprenti from './kaito-apprenti/kaito-apprenti.js';
import kaitoErmite from './kaito-ermite/kaito-ermite.js';
import kaitoFurie from './kaito-furie/kaito-furie.js';
import kaitoLegende from './kaito-legende/kaito-legende.js';
import kaitoDernierCombat from './kaito-dernier-combat/kaito-dernier-combat.js';
import renLeVengeur from './ren-le-vengeur/ren-le-vengeur.js';
import renIlEcarlate from './ren-il-ecarlate/ren-il-ecarlate.js';
import renAngeNoir from './ren-ange-noir/ren-ange-noir.js';
import hanaPoingDAcier from './hana-poing-d-acier/hana-poing-d-acier.js';
import hanaGuerisseuse from './hana-guerisseuse/hana-guerisseuse.js';
import kenjiLeStratege from './kenji-le-stratege/kenji-le-stratege.js';
import daichiLeColosse from './daichi-le-colosse/daichi-le-colosse.js';
import mizukiSageDeLEau from './mizuki-sage-de-l-eau/mizuki-sage-de-l-eau.js';
import akiraDanseDesLames from './akira-danse-des-lames/akira-danse-des-lames.js';
import harutoMarionnettiste from './haruto-marionnettiste/haruto-marionnettiste.js';
import yunaReineDesInsectes from './yuna-reine-des-insectes/yuna-reine-des-insectes.js';
import shinMaitreDesOs from './shin-maitre-des-os/shin-maitre-des-os.js';
import takumiArtisteExplosif from './takumi-artiste-explosif/takumi-artiste-explosif.js';
import goroLeSableRouge from './goro-le-sable-rouge/goro-le-sable-rouge.js';
import ayameCristalDeGlace from './ayame-cristal-de-glace/ayame-cristal-de-glace.js';
import jiroFumeeMortelle from './jiro-fumee-mortelle/jiro-fumee-mortelle.js';
import tsubasaLameDeTempete from './tsubasa-lame-de-tempete/tsubasa-lame-de-tempete.js';
import kuroGriffeNocturne from './kuro-griffe-nocturne/kuro-griffe-nocturne.js';
import shiroMoineRadieux from './shiro-moine-radieux/shiro-moine-radieux.js';
import momoPetitGenie from './momo-petit-genie/momo-petit-genie.js';
import hiroTonnerreRouge from './hiro-tonnerre-rouge/hiro-tonnerre-rouge.js';
import naoOmbreSilencieuse from './nao-ombre-silencieuse/nao-ombre-silencieuse.js';
import reijiSeigneurDuFeu from './reiji-seigneur-du-feu/reiji-seigneur-du-feu.js';
import sayaDanseuseDeLEventail from './saya-danseuse-de-l-eventail/saya-danseuse-de-l-eventail.js';
import ibukiMurDePierre from './ibuki-mur-de-pierre/ibuki-mur-de-pierre.js';
import kazumaPoingDeFer from './kazuma-poing-de-fer/kazuma-poing-de-fer.js';
import emiVagueCristalline from './emi-vague-cristalline/emi-vague-cristalline.js';
import ryoIlDuFaucon from './ryo-il-du-faucon/ryo-il-du-faucon.js';
import tomoGardienDuBrouillard from './tomo-gardien-du-brouillard/tomo-gardien-du-brouillard.js';
import yoshiBeteSauvage from './yoshi-bete-sauvage/yoshi-bete-sauvage.js';
import rakuMaitreDesPantins from './raku-maitre-des-pantins/raku-maitre-des-pantins.js';
import zenSageImmobile from './zen-sage-immobile/zen-sage-immobile.js';
import natsuSoleilArdent from './natsu-soleil-ardent/natsu-soleil-ardent.js';
import meiAlchimiste from './mei-alchimiste/mei-alchimiste.js';
import shoMaitreEclair from './sho-maitre-eclair/sho-maitre-eclair.js';
import taroGeantGentil from './taro-geant-gentil/taro-geant-gentil.js';
import noaEspritLibre from './noa-esprit-libre/noa-esprit-libre.js';
import umeFleurDeCerisier from './ume-fleur-de-cerisier/ume-fleur-de-cerisier.js';
import oboroVoileDeNuit from './oboro-voile-de-nuit/oboro-voile-de-nuit.js';
import ginjiroLeFaucheur from './ginjiro-le-faucheur/ginjiro-le-faucheur.js';
import ranmaruExplosionPure from './ranmaru-explosion-pure/ranmaru-explosion-pure.js';
import ikkiRoiDesFlammes from './ikki-roi-des-flammes/ikki-roi-des-flammes.js';
import wakabaJeunePousse from './wakaba-jeune-pousse/wakaba-jeune-pousse.js';
import yamiSeigneurDesTenebres from './yami-seigneur-des-tenebres/yami-seigneur-des-tenebres.js';
import hikariDeesseLumineuse from './hikari-deesse-lumineuse/hikari-deesse-lumineuse.js';
import genVieuxMaitre from './gen-vieux-maitre/gen-vieux-maitre.js';
import soraPiloteDuCiel from './sora-pilote-du-ciel/sora-pilote-du-ciel.js';
import kagamiMiroirBrise from './kagami-miroir-brise/kagami-miroir-brise.js';
import bakutoRoiDuChaos from './bakuto-roi-du-chaos/bakuto-roi-du-chaos.js';
import okamiAlpha from './okami-alpha/okami-alpha.js';
import mugenUltimeMaitre from './mugen-ultime-maitre/mugen-ultime-maitre.js';

export const CHARACTERS = [
  kaitoApprenti, kaitoErmite, kaitoFurie, kaitoLegende, kaitoDernierCombat,
  renLeVengeur, renIlEcarlate, renAngeNoir, hanaPoingDAcier, hanaGuerisseuse,
  kenjiLeStratege, daichiLeColosse, mizukiSageDeLEau, akiraDanseDesLames, harutoMarionnettiste,
  yunaReineDesInsectes, shinMaitreDesOs, takumiArtisteExplosif, goroLeSableRouge, ayameCristalDeGlace,
  jiroFumeeMortelle, tsubasaLameDeTempete, kuroGriffeNocturne, shiroMoineRadieux, momoPetitGenie,
  hiroTonnerreRouge, naoOmbreSilencieuse, reijiSeigneurDuFeu, sayaDanseuseDeLEventail, ibukiMurDePierre,
  kazumaPoingDeFer, emiVagueCristalline, ryoIlDuFaucon, tomoGardienDuBrouillard, yoshiBeteSauvage,
  rakuMaitreDesPantins, zenSageImmobile, natsuSoleilArdent, meiAlchimiste, shoMaitreEclair,
  taroGeantGentil, noaEspritLibre, umeFleurDeCerisier, oboroVoileDeNuit, ginjiroLeFaucheur,
  ranmaruExplosionPure, ikkiRoiDesFlammes, wakabaJeunePousse, yamiSeigneurDesTenebres, hikariDeesseLumineuse,
  genVieuxMaitre, soraPiloteDuCiel, kagamiMiroirBrise, bakutoRoiDuChaos, okamiAlpha, mugenUltimeMaitre,
];
