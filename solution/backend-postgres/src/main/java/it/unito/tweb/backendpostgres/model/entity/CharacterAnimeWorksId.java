package it.unito.tweb.backendpostgres.model.entity;

import java.io.Serializable;
import java.util.Objects;

public class CharacterAnimeWorksId implements Serializable {

    private Integer animeMalId;
    private Integer characterMalId;
    private String role;

    public CharacterAnimeWorksId() {}

    public CharacterAnimeWorksId(Integer animeMalId, Integer characterMalId, String role) {
        this.animeMalId = animeMalId;
        this.characterMalId = characterMalId;
        this.role = role;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CharacterAnimeWorksId that)) return false;
        return Objects.equals(animeMalId, that.animeMalId)
                && Objects.equals(characterMalId, that.characterMalId)
                && Objects.equals(role, that.role);
    }

    @Override
    public int hashCode() {
        return Objects.hash(animeMalId, characterMalId, role);
    }
}
