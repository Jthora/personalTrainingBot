import type { CardDeckPathMap } from "./common";
import agenciesDecks from "./agencies";
import combatDecks from "./combat";
import counterBiochemDecks from "./counterBiochem";
import counterPsyopsDecks from "./counterPsyops";
import cybersecurityDecks from "./cybersecurity";
import danceDecks from "./dance";
import equationsDecks from "./equations";
import espionageDecks from "./espionage";
import fitnessDecks from "./fitness";
import intelligenceDecks from "./intelligence";
import investigationDecks from "./investigation";
import martialArtsDecks from "./martialArts";
import psiopsDecks from "./psiops";
import warStrategyDecks from "./warStrategy";
import webThreeDecks from "./webThree";
import selfSovereigntyDecks from "./selfSovereignty";
import antiPsnDecks from "./antiPsn";
import antiTcsIdcCbcDecks from "./antiTcsIdcCbc";
import spaceForceDecks from "./spaceForce";

export const cardDeckPaths: CardDeckPathMap = {
    ...agenciesDecks,
    ...combatDecks,
    ...counterBiochemDecks,
    ...counterPsyopsDecks,
    ...cybersecurityDecks,
    ...danceDecks,
    ...equationsDecks,
    ...espionageDecks,
    ...fitnessDecks,
    ...intelligenceDecks,
    ...investigationDecks,
    ...martialArtsDecks,
    ...psiopsDecks,
    ...warStrategyDecks,
    ...webThreeDecks,
    ...selfSovereigntyDecks,
    ...antiPsnDecks,
    ...antiTcsIdcCbcDecks,
    ...spaceForceDecks
};

export const totalCardDecks = 663;
