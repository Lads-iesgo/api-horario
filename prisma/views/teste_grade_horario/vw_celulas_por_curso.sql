SELECT
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `curso`,
  `g`.`idGrade` AS `idGrade`,
  `g`.`semestreLetivo` AS `semestreLetivo`,
  `g`.`anoLetivo` AS `anoLetivo`,
  `d`.`idDisciplina` AS `idDisciplina`,
  `d`.`nomeDisciplina` AS `disciplina`,
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `professor`,
  `ds`.`idDiaSemana` AS `idDiaSemana`,
  `ds`.`diaSemana` AS `dia_semana`,
  `ah`.`idSala` AS `idSala`
FROM
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