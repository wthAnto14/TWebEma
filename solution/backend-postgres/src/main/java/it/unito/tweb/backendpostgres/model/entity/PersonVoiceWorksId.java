package it.unito.tweb.backendpostgres.model.entity;

import java.io.Serializable;
import java.util.Objects;

public class PersonVoiceWorksId implements Serializable {

    private Integer personMalId;
    private Integer animeMalId;
    private Integer characterMalId;
    private String role;

    public PersonVoiceWorksId() {}

    public PersonVoiceWorksId(Integer personMalId, Integer animeMalId,
                              Integer characterMalId, String role) {
        this.personMalId = personMalId;
        this.animeMalId = animeMalId;
        this.characterMalId = characterMalId;
        this.role = role;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PersonVoiceWorksId that)) return false;
        return Objects.equals(personMalId, that.personMalId)
                && Objects.equals(animeMalId, that.animeMalId)
                && Objects.equals(characterMalId, that.characterMalId)
                && Objects.equals(role, that.role);
    }

    @Override
    public int hashCode() {
        return Objects.hash(personMalId, animeMalId, characterMalId, role);
    }
}
