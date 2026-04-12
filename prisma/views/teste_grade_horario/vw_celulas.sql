SELECT
  `ah`.`idAlocacaoHorario` AS `idCelula`,
  `ah`.`semestre` AS `semestreCelula`,
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `curso`,
  `c`.`duracaoSemestres` AS `duracaoSemestres`,
  `d`.`idDisciplina` AS `idDisciplina`,
  `d`.`codigoDisciplina` AS `codigoDisciplina`,
  `d`.`nomeDisciplina` AS `disciplina`,
  `d`.`modalidade` AS `modalidade`,
  `d`.`tipoSala` AS `tipo_sala`,
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `professor`,
  `p`.`titulacao` AS `titulacao`,
  `ds`.`idDiaSemana` AS `idDiaSemana`,
  `ds`.`diaSemana` AS `dia_semana`,
  `g`.`idGrade` AS `idGrade`,
  `g`.`semestreLetivo` AS `semestreLetivo`,
  `g`.`anoLetivo` AS `anoLetivo`,
  `ah`.`idSala` AS `idSala`,
  `s`.`codigoSala` AS `codigoSala`,
  `s`.`nomeSala` AS `nomeSala`
FROM
  (
    (
      (
        (
          (
            (
              `teste_grade_horario`.`alocacao_horario` `ah`
              JOIN `teste_grade_horario`.`grade` `g` ON((`ah`.`idGrade` = `g`.`idGrade`))
            )
            JOIN `teste_grade_horario`.`curso` `c` ON((`g`.`idCurso` = `c`.`idCurso`))
          )
          JOIN `teste_grade_horario`.`disciplina` `d` ON((`ah`.`idDisciplina` = `d`.`idDisciplina`))
        )
        JOIN `teste_grade_horario`.`professor` `p` ON((`ah`.`idProfessor` = `p`.`idProfessor`))
      )
      JOIN `teste_grade_horario`.`dia_semana` `ds` ON((`ah`.`idDiaSemana` = `ds`.`idDiaSemana`))
    )
    LEFT JOIN `teste_grade_horario`.`sala` `s` ON((`ah`.`idSala` = `s`.`idSala`))
  )