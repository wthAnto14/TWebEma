package it.unito.tweb.backendpostgres.model.dto;

import it.unito.tweb.backendpostgres.model.entity.AnimeDetails;
import it.unito.tweb.backendpostgres.model.entity.Stats;
import it.unito.tweb.backendpostgres.model.projection.AnimeCharacterProjection;
import it.unito.tweb.backendpostgres.model.projection.VoiceActorProjection;

import java.util.List;

public class AnimePageData {

    private final AnimeDetails anime;
    private final Stats stats;
    private final List<AnimeCharacterProjection> characters;
    private final List<VoiceActorProjection> voiceActors;
    private List<AnimeDetails> recommendations;

    public AnimePageData(AnimeDetails anime,
                         Stats stats,
                         List<AnimeCharacterProjection> characters,
                         List<VoiceActorProjection> voiceActors,
                         List<AnimeDetails> recommendations) {
        this.anime = anime;
        this.stats = stats;
        this.characters = characters;
        this.voiceActors = voiceActors;
        this.recommendations = recommendations;
    }

    public AnimeDetails getAnime() { return anime; }
    public Stats getStats() { return stats; }
    public List<AnimeCharacterProjection> getCharacters() { return characters; }
    public List<VoiceActorProjection> getVoiceActors() { return voiceActors; }
    public List<AnimeDetails> getRecommendations() { return recommendations; }

}
